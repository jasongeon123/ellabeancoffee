const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    // Get all testimonials
    const testimonialsResult = await pool.query('SELECT * FROM "Testimonial"');
    const testimonials = testimonialsResult.rows;
    console.log(`Found ${testimonials.length} testimonials\n`);

    // Approve all testimonials
    const approveResult = await pool.query(
      'UPDATE "Testimonial" SET approved = true, "updatedAt" = NOW() WHERE approved = false'
    );
    console.log(`✓ Approved ${approveResult.rowCount} testimonials\n`);

    // Mark first 2 as featured
    const firstTwo = testimonials.slice(0, 2);
    for (const t of firstTwo) {
      await pool.query(
        'UPDATE "Testimonial" SET featured = true, "updatedAt" = NOW() WHERE id = $1',
        [t.id]
      );
      console.log(`✓ Featured: ${t.name}`);
    }

    // Verify approved count
    const approvedResult = await pool.query(
      'SELECT COUNT(*) FROM "Testimonial" WHERE approved = true'
    );
    console.log(`\n✓ Total approved testimonials: ${approvedResult.rows[0].count}`);
    console.log('✓ Homepage section should now be visible!\n');
  } finally {
    await pool.end();
  }
}

main().catch((e) => console.error(e));
