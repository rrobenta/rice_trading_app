import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../../db/prisma';
import { AuthRequest } from '../../types';
import { createError } from '../../middleware/error-handler';
import { getPaginationParams, buildPaginatedResponse } from '../../utils/pagination';

export async function getListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query as any);
    const { varietyId, minPrice, maxPrice, location, search } = req.query as Record<string, string>;

    const where: any = { isActive: true };
    if (varietyId) where.varietyId = varietyId;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.pricePerKg = {};
      if (minPrice) where.pricePerKg.gte = minPrice;
      if (maxPrice) where.pricePerKg.lte = maxPrice;
    }

    const [data, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          variety: true,
          seller: { select: { id: true, name: true, company: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
}

export async function getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        variety: true,
        seller: { select: { id: true, name: true, company: true, phone: true } },
      },
    });
    if (!listing) {
      next(createError('Listing not found', 404));
      return;
    }
    res.json(listing);
  } catch (err) {
    next(err);
  }
}

export async function createListing(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, description, pricePerKg, quantityKg, minOrderKg, grade, moisture, location, imageUrl, varietyId } = req.body;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        pricePerKg,
        quantityKg,
        minOrderKg: minOrderKg || 1,
        grade,
        moisture,
        location,
        imageUrl,
        sellerId: req.user!.userId,
        varietyId,
      },
      include: { variety: true, seller: { select: { id: true, name: true, company: true } } },
    });

    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
}

export async function updateListing(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) {
      next(createError('Listing not found', 404));
      return;
    }
    if (listing.sellerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      next(createError('Forbidden', 403));
      return;
    }

    const { title, description, pricePerKg, quantityKg, minOrderKg, grade, moisture, location, imageUrl, isActive } = req.body;

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: { title, description, pricePerKg, quantityKg, minOrderKg, grade, moisture, location, imageUrl, isActive },
      include: { variety: true, seller: { select: { id: true, name: true, company: true } } },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteListing(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) {
      next(createError('Listing not found', 404));
      return;
    }
    if (listing.sellerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      next(createError('Forbidden', 403));
      return;
    }

    await prisma.listing.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
