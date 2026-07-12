import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Decimal } from 'decimal.js';
import prisma from '../../db/prisma';
import { AuthRequest } from '../../types';
import { createError } from '../../middleware/error-handler';
import { getPaginationParams, buildPaginatedResponse } from '../../utils/pagination';

export async function getOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query as any);
    const { type, status, varietyId } = req.query as Record<string, string>;

    const where: any = { userId: req.user!.userId };
    if (type) where.type = type;
    if (status) where.status = status;
    if (varietyId) where.varietyId = varietyId;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { variety: true },
      }),
      prisma.order.count({ where }),
    ]);

    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        variety: true,
        buyTrades: { include: { seller: { select: { id: true, name: true, company: true } } } },
        sellTrades: { include: { buyer: { select: { id: true, name: true, company: true } } } },
      },
    });
    if (!order) {
      next(createError('Order not found', 404));
      return;
    }
    if (order.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      next(createError('Forbidden', 403));
      return;
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { type, pricePerKg, quantityKg, varietyId, notes, expiresAt } = req.body;

    const order = await prisma.order.create({
      data: {
        type,
        pricePerKg,
        quantityKg,
        varietyId,
        notes,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: req.user!.userId,
      },
      include: { variety: true },
    });

    // Attempt order matching
    await matchOrders(order.id, type, varietyId, pricePerKg, req.user!.userId);

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { variety: true },
    });

    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      next(createError('Order not found', 404));
      return;
    }
    if (order.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      next(createError('Forbidden', 403));
      return;
    }
    if (order.status === 'FILLED' || order.status === 'CANCELLED') {
      next(createError('Order cannot be cancelled', 400));
      return;
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: { variety: true },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Simple order matching engine: matches a new order against open opposing orders
 * by price compatibility, oldest first (price-time priority).
 */
async function matchOrders(
  orderId: string,
  type: 'BUY' | 'SELL',
  varietyId: string,
  pricePerKg: string,
  userId: string
): Promise<void> {
  const oppositeType = type === 'BUY' ? 'SELL' : 'BUY';

  // Resolve variety name once before the matching loop (used in price history)
  const variety = await prisma.riceVariety.findUnique({ where: { id: varietyId }, select: { name: true } });
  const varietyName = variety?.name ?? varietyId;

  const candidates = await prisma.order.findMany({
    where: {
      type: oppositeType,
      varietyId,
      status: { in: ['OPEN', 'PARTIALLY_FILLED'] },
      userId: { not: userId }, // don't self-match
      ...(type === 'BUY'
        ? { pricePerKg: { lte: pricePerKg } } // buy: find sellers at or below our price
        : { pricePerKg: { gte: pricePerKg } }), // sell: find buyers at or above our price
    },
    orderBy: [
      { pricePerKg: type === 'BUY' ? 'asc' : 'desc' }, // best price first
      { createdAt: 'asc' }, // then oldest
    ],
  });

  let currentOrder = await prisma.order.findUnique({ where: { id: orderId } });
  if (!currentOrder) return;

  let remaining = new Decimal(currentOrder.quantityKg.toString()).minus(new Decimal(currentOrder.filledKg.toString()));

  for (const candidate of candidates) {
    if (remaining.lte(0)) break;

    const candidateRemaining = new Decimal(candidate.quantityKg.toString()).minus(new Decimal(candidate.filledKg.toString()));
    const fillQty = Decimal.min(remaining, candidateRemaining);
    const tradePrice = new Decimal(candidate.pricePerKg.toString());
    const totalAmount = fillQty.times(tradePrice);

    const buyOrderId = type === 'BUY' ? orderId : candidate.id;
    const sellOrderId = type === 'SELL' ? orderId : candidate.id;
    const buyerId = type === 'BUY' ? userId : candidate.userId;
    const sellerId = type === 'SELL' ? userId : candidate.userId;

    const newRemaining = remaining.minus(fillQty);
    const newCandidateRemaining = candidateRemaining.minus(fillQty);

    // Compute new filledKg values explicitly for reliable status assignment
    const currentFilledKg = new Decimal(currentOrder.filledKg.toString());
    const candidateFilledKg = new Decimal(candidate.filledKg.toString());
    const newCurrentFilledKg = currentFilledKg.plus(fillQty);
    const newCandidateFilledKg = candidateFilledKg.plus(fillQty);

    await prisma.$transaction([
      prisma.trade.create({
        data: {
          quantityKg: fillQty.toString(),
          pricePerKg: tradePrice.toString(),
          totalAmount: totalAmount.toString(),
          buyerId,
          sellerId,
          buyOrderId,
          sellOrderId,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          filledKg: newCurrentFilledKg.toString(),
          status: newRemaining.lte(0) ? 'FILLED' : 'PARTIALLY_FILLED',
        },
      }),
      prisma.order.update({
        where: { id: candidate.id },
        data: {
          filledKg: newCandidateFilledKg.toString(),
          status: newCandidateRemaining.lte(0) ? 'FILLED' : 'PARTIALLY_FILLED',
        },
      }),
      prisma.priceHistory.create({
        data: {
          varietyName,
          pricePerKg: tradePrice.toString(),
          volumeKg: fillQty.toString(),
        },
      }),
    ]);

    // Update currentOrder's filledKg in memory for next loop iteration
    currentOrder = { ...currentOrder, filledKg: newCurrentFilledKg as any };
    remaining = newRemaining;
  }
}
