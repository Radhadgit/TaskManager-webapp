import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';

export async function GET() {
  try {
    // Check database connection
    await connectDB();
    
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'task-manager-app',
        version: '1.0.0',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'task-manager-app',
        error: error.message,
      },
      { status: 503 }
    );
  }
}

