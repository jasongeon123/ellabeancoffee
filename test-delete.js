const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    // Get current count
    const beforeResult = await pool.query('SELECT COUNT(*) FROM "Testimonial"');
    const before = parseInt(beforeResult.rows[0].count);
    console.log(`Total testimonials before delete: ${before}\n`);

    // Delete one testimonial (Tom Anderson)
    const deletedResult = await pool.query(
      'DELETE FROM "Testimonial" WHERE id = $1 RETURNING *',
      ['cmhehzi2o0004k1twdlm0gqel']
    );

    if (deletedResult.rows.length > 0) {
      const deleted = deletedResult.rows[0];
      console.log(`✓ Deleted testimonial: ${deleted.name}\n`);
    } else {
      console.log('⚠ Testimonial not found (may have already been deleted)\n');
    }

    // Verify count after delete
    const afterResult = await pool.query('SELECT COUNT(*) FROM "Testimonial"');
    const after = parseInt(afterResult.rows[0].count);
    console.log(`Total testimonials after delete: ${after}`);

    const approvedResult = await pool.query(
      'SELECT COUNT(*) FROM "Testimonial" WHERE approved = true'
    );
    const approved = parseInt(approvedResult.rows[0].count);
    console.log(`Approved testimonials: ${approved}`);

    if (approved < 5) {
      console.log('\n⚠ Less than 5 approved - homepage section will be HIDDEN');
    } else {
      console.log('\n✓ 5+ approved - homepage section will be VISIBLE');
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => console.error(e));
