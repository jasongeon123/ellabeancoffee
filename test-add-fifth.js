const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Add a new testimonial and approve it immediately
  const testimonial = await prisma.testimonial.create({
    data: {
      name: 'Jessica Martinez',
      email: 'jessica@example.com',
      rating: 5,
      comment: 'The best coffee in town! I love supporting local businesses that care about quality.',
      approved: true, // Approve immediately
      featured: false,
    },
  });

  console.log(`✓ Created and approved testimonial: ${testimonial.name}\n`);

  // Check approved count
  const approved = await prisma.testimonial.findMany({
    where: { approved: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });

  console.log(`Total approved testimonials: ${approved.length}`);
  console.log('\nApproved testimonials:');
  approved.forEach((t, i) => {
    const featured = t.featured ? ' ⭐ FEATURED' : '';
    console.log(`  ${i + 1}. ${t.name} (${t.rating} stars)${featured}`);
  });

  if (approved.length >= 5) {
    console.log('\n✓ 5+ approved testimonials - Homepage section will be VISIBLE!\n');
  } else {
    console.log(`\n⚠ Only ${approved.length} approved - Need ${5 - approved.length} more for homepage visibility\n`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
