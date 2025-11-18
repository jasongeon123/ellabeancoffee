import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export async function GET() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Test direct query
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1 LIMIT 1', ['admin@ellabean.com']);
    const user = result.rows[0];

    pool.end();

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
