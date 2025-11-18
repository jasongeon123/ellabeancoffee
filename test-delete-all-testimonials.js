const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    // Delete all testimonials
    const result = await pool.query('DELETE FROM "Testimonial"');

    console.log(`✓ Deleted ${result.rowCount} testimonials\n`);
    console.log('All fake testimonials have been removed.');
    console.log('The testimonials section will now be hidden until real ones are added.\n');
  } finally {
    await pool.end();
  }
}

main().catch((e) => console.error(e));
