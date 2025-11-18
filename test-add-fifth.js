const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    // Add a new testimonial and approve it immediately
    const testimonialResult = await pool.query(
      `INSERT INTO "Testimonial" (id, name, email, rating, comment, approved, featured, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        'Jessica Martinez',
        'jessica@example.com',
        5,
        'The best coffee in town! I love supporting local businesses that care about quality.',
        true,
        false
      ]
    );
    const testimonial = testimonialResult.rows[0];

    console.log(`✓ Created and approved testimonial: ${testimonial.name}\n`);

    // Check approved count
    const approvedResult = await pool.query(
      `SELECT * FROM "Testimonial"
       WHERE approved = true
       ORDER BY featured DESC, "createdAt" DESC`
    );
    const approved = approvedResult.rows;

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
  } finally {
    await pool.end();
  }
}

main().catch((e) => console.error(e));
