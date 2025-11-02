const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get current count
  const before = await prisma.testimonial.count();
  console.log(`Total testimonials before delete: ${before}\n`);

  // Delete one testimonial (Tom Anderson)
  const deleted = await prisma.testimonial.delete({
    where: { id: 'cmhehzi2o0004k1twdlm0gqel' },
  });
  console.log(`✓ Deleted testimonial: ${deleted.name}\n`);

  // Verify count after delete
  const after = await prisma.testimonial.count();
  console.log(`Total testimonials after delete: ${after}`);

  const approved = await prisma.testimonial.count({
    where: { approved: true },
  });
  console.log(`Approved testimonials: ${approved}`);

  if (approved < 5) {
    console.log('\n⚠ Less than 5 approved - homepage section will be HIDDEN');
  } else {
    console.log('\n✓ 5+ approved - homepage section will be VISIBLE');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
