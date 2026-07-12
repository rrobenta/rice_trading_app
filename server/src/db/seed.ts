import prisma from './prisma';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed rice varieties
  const varieties = await Promise.all([
    prisma.riceVariety.upsert({
      where: { name: 'Jasmine Rice' },
      update: {},
      create: { name: 'Jasmine Rice', description: 'Fragrant long-grain rice', origin: 'Thailand' },
    }),
    prisma.riceVariety.upsert({
      where: { name: 'Basmati Rice' },
      update: {},
      create: { name: 'Basmati Rice', description: 'Aromatic long-grain rice', origin: 'India' },
    }),
    prisma.riceVariety.upsert({
      where: { name: 'Short Grain White' },
      update: {},
      create: { name: 'Short Grain White', description: 'Sticky short-grain rice', origin: 'Japan' },
    }),
    prisma.riceVariety.upsert({
      where: { name: 'Brown Rice' },
      update: {},
      create: { name: 'Brown Rice', description: 'Whole grain brown rice', origin: 'Various' },
    }),
    prisma.riceVariety.upsert({
      where: { name: 'Parboiled Rice' },
      update: {},
      create: { name: 'Parboiled Rice', description: 'Parboiled long-grain rice', origin: 'Various' },
    }),
  ]);

  // Seed users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@example.com' },
    update: {},
    create: {
      email: 'supplier@example.com',
      passwordHash: hashedPassword,
      name: 'Golden Grain Co.',
      role: 'SUPPLIER',
      company: 'Golden Grain Co.',
      phone: '+66-2-123-4567',
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      passwordHash: hashedPassword,
      name: 'Metro Foods Ltd.',
      role: 'BUYER',
      company: 'Metro Foods Ltd.',
    },
  });

  const trader = await prisma.user.upsert({
    where: { email: 'trader@example.com' },
    update: {},
    create: {
      email: 'trader@example.com',
      passwordHash: hashedPassword,
      name: 'Asia Rice Traders',
      role: 'TRADER',
      company: 'Asia Rice Traders',
    },
  });

  // Seed listings
  await prisma.listing.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Premium Jasmine Rice - Grade A',
        description: 'First-crop jasmine rice, low moisture, excellent aroma',
        pricePerKg: '1.85',
        quantityKg: '50000',
        minOrderKg: '1000',
        grade: 'Grade A',
        moisture: '14.0',
        location: 'Bangkok, Thailand',
        sellerId: supplier.id,
        varietyId: varieties[0].id,
      },
      {
        title: 'Basmati Rice - Export Quality',
        description: 'Long grain basmati, aged 1 year for best aroma',
        pricePerKg: '2.20',
        quantityKg: '30000',
        minOrderKg: '500',
        grade: 'Extra Long',
        moisture: '13.5',
        location: 'Punjab, India',
        sellerId: supplier.id,
        varietyId: varieties[1].id,
      },
      {
        title: 'Parboiled Rice Bulk Lot',
        description: 'Standard parboiled rice suitable for food manufacturing',
        pricePerKg: '0.95',
        quantityKg: '100000',
        minOrderKg: '5000',
        grade: 'Standard',
        moisture: '14.5',
        location: 'Ho Chi Minh City, Vietnam',
        sellerId: trader.id,
        varietyId: varieties[4].id,
      },
    ],
  });

  // Seed price history
  const now = new Date();
  const priceHistoryData: { varietyName: string; pricePerKg: string; volumeKg: string; recordedAt: Date }[] = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    priceHistoryData.push(
      { varietyName: 'Jasmine Rice', pricePerKg: (1.75 + Math.random() * 0.2).toFixed(4), volumeKg: (10000 + Math.random() * 5000).toFixed(2), recordedAt: date },
      { varietyName: 'Basmati Rice', pricePerKg: (2.10 + Math.random() * 0.25).toFixed(4), volumeKg: (8000 + Math.random() * 3000).toFixed(2), recordedAt: date },
      { varietyName: 'Parboiled Rice', pricePerKg: (0.85 + Math.random() * 0.15).toFixed(4), volumeKg: (20000 + Math.random() * 8000).toFixed(2), recordedAt: date },
    );
  }

  await prisma.priceHistory.createMany({ data: priceHistoryData });

  console.log('✅ Seed complete');
  console.log('  Demo accounts (password: password123):');
  console.log('  - supplier@example.com (SUPPLIER)');
  console.log('  - buyer@example.com (BUYER)');
  console.log('  - trader@example.com (TRADER)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
