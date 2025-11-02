const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all testimonials
  const testimonials = await prisma.testimonial.findMany();
  console.log(`Found ${testimonials.length} testimonials\n`);

  // Approve all testimonials
  const result = await prisma.testimonial.updateMany({
    where: { approved: false },
    data: { approved: true },
  });
  console.log(`✓ Approved ${result.count} testimonials\n`);

  // Mark first 2 as featured
  const firstTwo = testimonials.slice(0, 2);
  for (const t of firstTwo) {
    await prisma.testimonial.update({
      where: { id: t.id },
      data: { featured: true },
    });
    console.log(`✓ Featured: ${t.name}`);
  }

  // Verify approved count
  const approved = await prisma.testimonial.findMany({
    where: { approved: true },
  });
  console.log(`\n✓ Total approved testimonials: ${approved.length}`);
  console.log('✓ Homepage section should now be visible!\n');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
