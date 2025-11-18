import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const diagnostics = {
      nodeEnv: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      databaseUrlHasPooler: process.env.DATABASE_URL?.includes('-pooler') || false,
      platform: process.platform,
      versions: {
        node: process.version,
      }
    };

    return NextResponse.json({
      success: true,
      diagnostics,
      message: 'Check if NODE_ENV is production and DATABASE_URL is set correctly'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
