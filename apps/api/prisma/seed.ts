import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@invoiceflow.app' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@invoiceflow.app',
      passwordHash: adminHash,
      name: 'Admin',
      role: 'ADMIN',
      businessName: 'InvoiceFlow',
      settings: { create: {} },
    },
  });

  const demoHash = await bcrypt.hash('demo1234', 10);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@invoiceflow.app' },
    update: {},
    create: {
      email: 'demo@invoiceflow.app',
      passwordHash: demoHash,
      name: 'Demo User',
      businessName: 'Acme Services LLC',
      businessPhone: '+1 (555) 123-4567',
      businessEmail: 'billing@acmeservices.com',
      businessAddress: '123 Main St, Austin, TX 78701',
      taxId: '12-3456789',
      currency: 'USD',
      settings: { create: { defaultTaxRate: 8.25, templateId: 'modern', primaryColor: '#2563EB' } },
    },
  });

  const client1 = await prisma.client.upsert({
    where: { id: 'seed-client-1' },
    update: {},
    create: {
      id: 'seed-client-1',
      userId: demo.id,
      name: 'John Smith',
      email: 'john@smithcorp.com',
      phone: '+1 (555) 987-6543',
      company: 'Smith Corp',
      address: '456 Oak Ave',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      userId: demo.id,
      name: 'Sarah Johnson',
      email: 'sarah@buildright.com',
      company: 'BuildRight Construction',
      phone: '+1 (555) 234-5678',
      city: 'Houston',
      state: 'TX',
    },
  });

  await prisma.invoice.create({
    data: {
      userId: demo.id,
      clientId: client1.id,
      documentNumber: 'INV-1001',
      documentType: 'INVOICE',
      status: 'PAID',
      issueDate: new Date('2026-06-01'),
      dueDate: new Date('2026-06-15'),
      subtotal: 1500,
      taxTotal: 123.75,
      discountTotal: 0,
      total: 1623.75,
      paidAt: new Date('2026-06-10'),
      sentAt: new Date('2026-06-01'),
      lineItems: {
        create: [
          { description: 'Plumbing repair - kitchen sink', quantity: 3, unitPrice: 150, taxRate: 8.25, total: 487.13, sortOrder: 0 },
          { description: 'Pipe replacement materials', quantity: 1, unitPrice: 1050, taxRate: 8.25, total: 1136.63, sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: demo.id,
      clientId: client2.id,
      documentNumber: 'EST-2001',
      documentType: 'ESTIMATE',
      status: 'SENT',
      issueDate: new Date('2026-06-15'),
      dueDate: new Date('2026-07-15'),
      subtotal: 3200,
      taxTotal: 264,
      discountTotal: 100,
      total: 3364,
      sentAt: new Date('2026-06-15'),
      lineItems: {
        create: [
          { description: 'Bathroom renovation labor', quantity: 40, unitPrice: 75, taxRate: 8.25, total: 3247.5, sortOrder: 0 },
          { description: 'Fixture installation', quantity: 1, unitPrice: 200, taxRate: 8.25, discount: 100, total: 116.5, sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.expense.createMany({
    data: [
      { userId: demo.id, description: 'Home Depot - pipe fittings', amount: 87.43, category: 'Materials', vendor: 'Home Depot' },
      { userId: demo.id, description: 'Fuel - service calls', amount: 65.00, category: 'Travel', vendor: 'Shell' },
      { userId: demo.id, description: 'Tool rental', amount: 120.00, category: 'Equipment', vendor: 'Sunbelt Rentals' },
    ],
  });

  console.log('Seed complete:', { admin: admin.email, demo: demo.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
