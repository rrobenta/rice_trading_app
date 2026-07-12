import { Response, NextFunction } from 'express';
import prisma from '../../db/prisma';
import { AuthRequest } from '../../types';
import { createError } from '../../middleware/error-handler';
import { getPaginationParams, buildPaginatedResponse } from '../../utils/pagination';

export async function getTrades(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query as any);
    const userId = req.user!.userId;

    const where: any = {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    };

    const [data, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, company: true } },
          seller: { select: { id: true, name: true, company: true } },
          buyOrder: { include: { variety: true } },
        },
      }),
      prisma.trade.count({ where }),
    ]);

    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
}

export async function getTradeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const trade = await prisma.trade.findUnique({
      where: { id: req.params.id },
      include: {
        buyer: { select: { id: true, name: true, company: true, email: true } },
        seller: { select: { id: true, name: true, company: true, email: true } },
        buyOrder: { include: { variety: true } },
        sellOrder: { include: { variety: true } },
      },
    });

    if (!trade) {
      next(createError('Trade not found', 404));
      return;
    }

    const userId = req.user!.userId;
    if (trade.buyerId !== userId && trade.sellerId !== userId && req.user!.role !== 'ADMIN') {
      next(createError('Forbidden', 403));
      return;
    }

    res.json(trade);
  } catch (err) {
    next(err);
  }
}

export async function updateTradeStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body;
    const validStatuses = ['COMPLETED', 'DISPUTED'];
    if (!validStatuses.includes(status)) {
      next(createError('Invalid status', 400));
      return;
    }

    const trade = await prisma.trade.findUnique({ where: { id: req.params.id } });
    if (!trade) {
      next(createError('Trade not found', 404));
      return;
    }

    const userId = req.user!.userId;
    if (trade.buyerId !== userId && trade.sellerId !== userId) {
      next(createError('Forbidden', 403));
      return;
    }

    const updated = await prisma.trade.update({
      where: { id: req.params.id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
