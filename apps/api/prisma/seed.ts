import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database…');

  // ── Tenant ────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Store',
      slug: 'demo',
      theme: {
        primaryColor: '#0f172a',
        currencyCode: 'USD',
        taxRate: 0.1,
        tenantName: 'Demo Store',
      },
      isActive: true,
    },
  });
  console.log(`✔ Tenant:   ${tenant.name}  (slug: ${tenant.slug})`);

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@swiftpos.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@swiftpos.com',
      name: 'Admin User',
      password: adminHash,
      role: 'admin',
    },
  });
  console.log(`✔ Admin:    ${admin.email}`);

  const cashierHash = await bcrypt.hash('password123', 10);
  const cashier = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'cashier@swiftpos.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'cashier@swiftpos.com',
      name: 'Cashier User',
      password: cashierHash,
      role: 'cashier',
    },
  });
  console.log(`✔ Cashier:  ${cashier.email}`);

  // ── Categories ────────────────────────────────────────────────────────────
  const [drinks, mains, snacks] = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-drinks' },
      update: {},
      create: { id: 'cat-drinks', tenantId: tenant.id, name: 'Drinks', sortOrder: 0 },
    }),
    prisma.category.upsert({
      where: { id: 'cat-mains' },
      update: {},
      create: { id: 'cat-mains', tenantId: tenant.id, name: 'Mains', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { id: 'cat-snacks' },
      update: {},
      create: { id: 'cat-snacks', tenantId: tenant.id, name: 'Snacks', sortOrder: 2 },
    }),
  ]);
  console.log(`✔ Categories: ${[drinks, mains, snacks].map((c) => c.name).join(', ')}`);

  // ── Products ──────────────────────────────────────────────────────────────
  const products = [
    { id: 'prod-espresso',  name: 'Espresso',      price: 3.50, categoryId: drinks.id,  variants: [] },
    { id: 'prod-latte',     name: 'Latte',         price: 4.50, categoryId: drinks.id,
      variants: [
        { id: 'var-latte-s', name: 'Small',  price: 4.00 },
        { id: 'var-latte-m', name: 'Medium', price: 4.50 },
        { id: 'var-latte-l', name: 'Large',  price: 5.00 },
      ],
    },
    { id: 'prod-oj',        name: 'Orange Juice',  price: 3.00, categoryId: drinks.id,  variants: [] },
    { id: 'prod-burger',    name: 'Burger',        price: 9.50, categoryId: mains.id,   variants: [] },
    { id: 'prod-pasta',     name: 'Pasta',         price: 11.00, categoryId: mains.id,  variants: [] },
    { id: 'prod-salad',     name: 'Garden Salad',  price: 7.50, categoryId: mains.id,   variants: [] },
    { id: 'prod-fries',     name: 'Fries',         price: 3.50, categoryId: snacks.id,  variants: [] },
    { id: 'prod-chips',     name: 'Chips',         price: 2.00, categoryId: snacks.id,  variants: [] },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        tenantId: tenant.id,
        categoryId: p.categoryId,
        name: p.name,
        price: p.price,
        variants: p.variants,
        isAvailable: true,
        trackInventory: false,
      },
    });
  }
  console.log(`✔ Products: ${products.map((p) => p.name).join(', ')}`);

  console.log('\n─────────────────────────────────────────');
  console.log('Seed complete. Log in with:');
  console.log('  Store ID : demo');
  console.log('  Email    : admin@swiftpos.com');
  console.log('  Password : password123');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
