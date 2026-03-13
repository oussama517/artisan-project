import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.artisanService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.artisanProfile.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('Password1!', 12);

  // ─── Admin User ──────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@artisan-marketplace.local',
      passwordHash: hash,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('✅ Admin: admin@artisan-marketplace.local / Password1!');

  // ─── Customer Users ──────────────────────────────
  const customers = await Promise.all([
    prisma.user.create({ data: { email: 'sarah@example.com', passwordHash: hash, name: 'Sarah Johnson', role: 'CUSTOMER', emailVerified: true, phone: '+1-555-0101' } }),
    prisma.user.create({ data: { email: 'ahmed@example.com', passwordHash: hash, name: 'Ahmed Benali', role: 'CUSTOMER', emailVerified: true, phone: '+212-6-0102' } }),
    prisma.user.create({ data: { email: 'emma@example.com', passwordHash: hash, name: 'Emma Wilson', role: 'CUSTOMER', emailVerified: true, phone: '+1-555-0103' } }),
  ]);
  console.log(`✅ ${customers.length} customers created`);

  // ─── Artisan Users + Profiles ────────────────────
  const artisanData = [
    { email: 'karim@example.com', name: 'Karim El Fassi', profession: 'Master Plumber', description: 'Licensed plumber with 15 years of experience in residential and commercial plumbing. Specializing in pipe repair, water heater installation, and bathroom renovations.', experience: 15, area: 'Casablanca', skills: ['Pipe Repair', 'Water Heater', 'Drain Cleaning', 'Bathroom Renovation', 'Emergency Plumbing'] },
    { email: 'fatima@example.com', name: 'Fatima Zahra', profession: 'Licensed Electrician', description: 'Certified electrician with a focus on residential electrical work. I handle everything from rewiring to smart home installations with a strong emphasis on safety.', experience: 8, area: 'Rabat', skills: ['Rewiring', 'Panel Upgrades', 'Lighting', 'Smart Home', 'Safety Inspections'] },
    { email: 'younes@example.com', name: 'Younes Amrani', profession: 'Carpenter & Woodworker', description: 'Skilled carpenter creating custom furniture, cabinetry, and home improvements. Passionate about combining traditional craftsmanship with modern design.', experience: 12, area: 'Marrakech', skills: ['Custom Furniture', 'Cabinetry', 'Flooring', 'Door Installation', 'Wood Repair'] },
    { email: 'amina@example.com', name: 'Amina Berrada', profession: 'Interior Painter', description: 'Professional painter specializing in interior and exterior painting. I bring color and life to spaces with precision and attention to detail.', experience: 6, area: 'Casablanca', skills: ['Interior Painting', 'Exterior Painting', 'Wallpaper', 'Texture Finishing', 'Color Consultation'] },
    { email: 'hassan@example.com', name: 'Hassan Ouali', profession: 'AC & HVAC Technician', description: 'Certified HVAC technician specializing in AC installation, repair, and maintenance. Keeping your home comfortable year-round.', experience: 10, area: 'Tangier', skills: ['AC Installation', 'AC Repair', 'Maintenance', 'Ventilation', 'Heating Systems'] },
  ];

  const artisans: any[] = [];
  for (const ad of artisanData) {
    const user = await prisma.user.create({
      data: { email: ad.email, passwordHash: hash, name: ad.name, role: 'ARTISAN', emailVerified: true },
    });

    const profile = await prisma.artisanProfile.create({
      data: {
        userId: user.id,
        profession: ad.profession,
        description: ad.description,
        yearsExperience: ad.experience,
        serviceArea: ad.area,
        skills: JSON.stringify(ad.skills),
        portfolioImages: '[]',
        approvalStatus: 'APPROVED',
        avgRating: 4 + Math.random(),
        totalReviews: Math.floor(Math.random() * 20) + 5,
        isAvailable: true,
      },
    });

    artisans.push({ user, profile });

    // Add availability (Mon-Fri 8:00-18:00, Sat 9:00-14:00)
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: { artisanProfileId: profile.id, dayOfWeek: day, startTime: '08:00', endTime: '18:00' },
      });
    }
    await prisma.availability.create({
      data: { artisanProfileId: profile.id, dayOfWeek: 6, startTime: '09:00', endTime: '14:00' },
    });
  }
  console.log(`✅ ${artisans.length} artisans created with availability`);

  // ─── Categories & Services ───────────────────────
  const categoryData = [
    { name: 'Plumbing', slug: 'plumbing', icon: '🔧', services: ['Pipe Repair', 'Drain Cleaning', 'Water Heater Installation', 'Faucet Replacement', 'Bathroom Renovation'] },
    { name: 'Electrical', slug: 'electrical', icon: '⚡', services: ['Rewiring', 'Panel Upgrade', 'Lighting Installation', 'Outlet Repair', 'Smart Home Setup'] },
    { name: 'Carpentry', slug: 'carpentry', icon: '🪚', services: ['Custom Furniture', 'Cabinet Installation', 'Flooring', 'Door Repair', 'Shelving'] },
    { name: 'Painting', slug: 'painting', icon: '🎨', services: ['Interior Painting', 'Exterior Painting', 'Wallpaper Installation', 'Texture Finishing'] },
    { name: 'AC & HVAC', slug: 'ac-repair', icon: '❄️', services: ['AC Installation', 'AC Repair', 'AC Maintenance', 'Heating Repair'] },
    { name: 'Appliance Repair', slug: 'appliance-repair', icon: '🔩', services: ['Washing Machine Repair', 'Refrigerator Repair', 'Oven Repair', 'Dishwasher Repair'] },
    { name: 'Locksmith', slug: 'locksmith', icon: '🔑', services: ['Lock Change', 'Key Duplication', 'Safe Installation', 'Emergency Lockout'] },
    { name: 'Cleaning', slug: 'cleaning', icon: '🧹', services: ['Deep Cleaning', 'Regular Cleaning', 'Move-In/Out Cleaning', 'Carpet Cleaning'] },
  ];

  const allServices: any[] = [];
  for (let i = 0; i < categoryData.length; i++) {
    const cd = categoryData[i];
    const category = await prisma.category.create({
      data: { name: cd.name, slug: cd.slug, icon: cd.icon, sortOrder: i },
    });

    for (const svc of cd.services) {
      const service = await prisma.service.create({
        data: {
          name: svc,
          slug: svc.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          categoryId: category.id,
          description: `Professional ${svc.toLowerCase()} service by verified artisans.`,
        },
      });
      allServices.push(service);
    }
  }
  console.log(`✅ ${categoryData.length} categories, ${allServices.length} services created`);

  // Link artisans to services
  const serviceLinks = [
    { artisanIdx: 0, serviceRange: [0, 4] },   // Karim -> Plumbing services
    { artisanIdx: 1, serviceRange: [5, 9] },   // Fatima -> Electrical services
    { artisanIdx: 2, serviceRange: [10, 14] }, // Younes -> Carpentry services
    { artisanIdx: 3, serviceRange: [15, 18] }, // Amina -> Painting services
    { artisanIdx: 4, serviceRange: [19, 22] }, // Hassan -> AC services
  ];

  for (const link of serviceLinks) {
    for (let i = link.serviceRange[0]; i <= Math.min(link.serviceRange[1], allServices.length - 1); i++) {
      await prisma.artisanService.create({
        data: {
          artisanProfileId: artisans[link.artisanIdx].profile.id,
          serviceId: allServices[i].id,
          estimatedDuration: 60 + Math.floor(Math.random() * 60),
        },
      });
    }
  }
  console.log('✅ Artisan-service links created');

  // ─── Bookings ────────────────────────────────────
  const bookingData = [
    { customerIdx: 0, artisanIdx: 0, serviceIdx: 0, status: 'COMPLETED', daysAgo: 14 },
    { customerIdx: 0, artisanIdx: 1, serviceIdx: 5, status: 'COMPLETED', daysAgo: 7 },
    { customerIdx: 1, artisanIdx: 2, serviceIdx: 10, status: 'ACCEPTED', daysAgo: -2 },
    { customerIdx: 1, artisanIdx: 0, serviceIdx: 2, status: 'PENDING', daysAgo: -5 },
    { customerIdx: 2, artisanIdx: 3, serviceIdx: 15, status: 'COMPLETED', daysAgo: 21 },
    { customerIdx: 2, artisanIdx: 4, serviceIdx: 19, status: 'IN_PROGRESS', daysAgo: 0 },
    { customerIdx: 0, artisanIdx: 4, serviceIdx: 20, status: 'CANCELLED', daysAgo: 3 },
    { customerIdx: 1, artisanIdx: 1, serviceIdx: 7, status: 'COMPLETED', daysAgo: 30 },
    { customerIdx: 2, artisanIdx: 0, serviceIdx: 1, status: 'PENDING', daysAgo: -3 },
    { customerIdx: 0, artisanIdx: 2, serviceIdx: 12, status: 'COMPLETED', daysAgo: 45 },
  ];

  const bookings: any[] = [];
  for (const bd of bookingData) {
    const date = new Date();
    date.setDate(date.getDate() - bd.daysAgo);

    const booking = await prisma.booking.create({
      data: {
        customerId: customers[bd.customerIdx].id,
        artisanProfileId: artisans[bd.artisanIdx].profile.id,
        serviceId: allServices[bd.serviceIdx].id,
        status: bd.status,
        scheduledDate: date,
        scheduledTime: '10:00',
        address: '123 Main Street, Apt 4',
        city: artisans[bd.artisanIdx].profile.serviceArea,
        problemDescription: 'I need help with this service. Please bring all necessary tools.',
        completedAt: bd.status === 'COMPLETED' ? date : null,
        cancellationReason: bd.status === 'CANCELLED' ? 'Schedule conflict' : null,
        cancelledBy: bd.status === 'CANCELLED' ? 'CUSTOMER' : null,
      },
    });
    bookings.push(booking);
  }
  console.log(`✅ ${bookings.length} bookings created`);

  // ─── Reviews ─────────────────────────────────────
  const completedBookings = bookings.filter((_, i) => bookingData[i].status === 'COMPLETED');
  const reviewTexts = [
    'Excellent work! Very professional and punctual. Highly recommend.',
    'Great service, fixed the issue quickly. Will book again.',
    'Very skilled and friendly. Explained everything clearly.',
    'Good work overall. Arrived on time and cleaned up after.',
    'Outstanding craftsmanship. Exceeded my expectations!',
  ];

  for (let i = 0; i < completedBookings.length; i++) {
    const bd = bookingData[bookings.indexOf(completedBookings[i])];
    await prisma.review.create({
      data: {
        bookingId: completedBookings[i].id,
        authorId: customers[bd.customerIdx].id,
        artisanProfileId: artisans[bd.artisanIdx].profile.id,
        rating: 4 + Math.floor(Math.random() * 2),
        comment: reviewTexts[i % reviewTexts.length],
        isApproved: true,
        moderatedAt: new Date(),
      },
    });
  }
  console.log(`✅ ${completedBookings.length} reviews created`);

  // ─── Conversations & Messages ────────────────────
  const conv = await prisma.conversation.create({
    data: {
      user1Id: customers[0].id < artisans[0].user.id ? customers[0].id : artisans[0].user.id,
      user2Id: customers[0].id < artisans[0].user.id ? artisans[0].user.id : customers[0].id,
      lastMessageAt: new Date(),
    },
  });

  const messages = [
    { senderId: customers[0].id, content: 'Hi! I have a leaking faucet. Are you available this week?' },
    { senderId: artisans[0].user.id, content: 'Hello Sarah! Yes, I can come by on Wednesday or Thursday. Which works better?' },
    { senderId: customers[0].id, content: 'Wednesday afternoon would be perfect. Around 2 PM?' },
    { senderId: artisans[0].user.id, content: "That works! I'll be there at 2 PM. Please have the area accessible." },
  ];

  for (let i = 0; i < messages.length; i++) {
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: messages[i].senderId,
        content: messages[i].content,
        isRead: true,
        createdAt: new Date(Date.now() - (messages.length - i) * 3600000),
      },
    });
  }
  console.log('✅ Sample conversation created');

  // ─── Favorites ───────────────────────────────────
  await prisma.favorite.create({ data: { userId: customers[0].id, artisanProfileId: artisans[0].profile.id } });
  await prisma.favorite.create({ data: { userId: customers[0].id, artisanProfileId: artisans[2].profile.id } });
  await prisma.favorite.create({ data: { userId: customers[1].id, artisanProfileId: artisans[1].profile.id } });
  console.log('✅ Favorites created');

  console.log('\n🎉 Seed complete!\n');
  console.log('─── Demo Credentials ───');
  console.log('Admin:    admin@artisan-marketplace.local / Password1!');
  console.log('Customer: sarah@example.com / Password1!');
  console.log('Customer: ahmed@example.com / Password1!');
  console.log('Artisan:  karim@example.com / Password1!');
  console.log('Artisan:  fatima@example.com / Password1!');
  console.log('(All accounts use password: Password1!)\n');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
