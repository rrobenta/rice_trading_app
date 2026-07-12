import { Request, Response, NextFunction } from 'express';
import { Decimal } from 'decimal.js';
import prisma from '../../db/prisma';

export async function getVarieties(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const varieties = await prisma.riceVariety.findMany({ orderBy: { name: 'asc' } });
    res.json(varieties);
  } catch (err) {
    next(err);
  }
}

export async function getPriceHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { variety, days = '30' } = req.query as Record<string, string>;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days, 10));

    const where: any = { recordedAt: { gte: since } };
    if (variety) where.varietyName = variety;

    const history = await prisma.priceHistory.findMany({
      where,
      orderBy: { recordedAt: 'asc' },
      select: { varietyName: true, pricePerKg: true, volumeKg: true, recordedAt: true },
    });

    res.json(history);
  } catch (err) {
    next(err);
  }
}

export async function getMarketSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 1);

    const varieties = await prisma.riceVariety.findMany();

    const summary = await Promise.all(
      varieties.map(async (v) => {
        const recentPrices = await prisma.priceHistory.findMany({
          where: { varietyName: v.name, recordedAt: { gte: since } },
          orderBy: { recordedAt: 'desc' },
          take: 10,
        });

        const prevPrices = await prisma.priceHistory.findMany({
          where: {
            varietyName: v.name,
            recordedAt: {
              gte: new Date(since.getTime() - 24 * 60 * 60 * 1000),
              lt: since,
            },
          },
          orderBy: { recordedAt: 'desc' },
          take: 1,
        });

        const openOrders = await prisma.order.count({
          where: { varietyId: v.id, status: { in: ['OPEN', 'PARTIALLY_FILLED'] } },
        });

        const currentPrice = recentPrices[0]?.pricePerKg ?? null;
        const previousPrice = prevPrices[0]?.pricePerKg ?? null;

        let change: string | null = null;
        let changePct: string | null = null;
        if (currentPrice && previousPrice) {
          const curr = new Decimal(currentPrice.toString());
          const prev = new Decimal(previousPrice.toString());
          change = curr.minus(prev).toFixed(4);
          changePct = curr.minus(prev).div(prev).times(100).toFixed(2);
        }

        return {
          variety: v,
          currentPrice,
          change,
          changePct,
          openOrders,
        };
      })
    );

    res.json(summary);
  } catch (err) {
    next(err);
  }
}
