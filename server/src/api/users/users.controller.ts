import { Response, NextFunction } from 'express';
import prisma from '../../db/prisma';
import { AuthRequest } from '../../types';
import { createError } from '../../middleware/error-handler';

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, company: true, phone: true, createdAt: true },
    });
    if (!user) {
      next(createError('User not found', 404));
      return;
    }

    const [totalListings, totalOrders, totalTrades] = await Promise.all([
      prisma.listing.count({ where: { sellerId: req.user!.userId } }),
      prisma.order.count({ where: { userId: req.user!.userId } }),
      prisma.trade.count({
        where: { OR: [{ buyerId: req.user!.userId }, { sellerId: req.user!.userId }] },
      }),
    ]);

    res.json({ ...user, stats: { totalListings, totalOrders, totalTrades } });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, company, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, company, phone },
      select: { id: true, email: true, name: true, role: true, company: true, phone: true },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
