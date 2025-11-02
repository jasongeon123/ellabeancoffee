const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete all testimonials
  const result = await prisma.testimonial.deleteMany({});

  console.log(`✓ Deleted ${result.count} testimonials\n`);
  console.log('All fake testimonials have been removed.');
  console.log('The testimonials section will now be hidden until real ones are added.\n');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
