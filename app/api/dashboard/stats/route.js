import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Task from '@/models/Task';
import { getUserIdFromRequest } from '@/utils/auth';

export async function GET() {
  try {
    const userId = await getUserIdFromRequest();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();

    const [totalTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'completed' }),
      Task.countDocuments({ userId, status: 'pending' }),
      Task.countDocuments({
        userId,
        status: { $ne: 'completed' },
        deadline: { $lt: now },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

