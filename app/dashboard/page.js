'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { 
  FaTasks, 
  FaChartLine, 
  FaSignOutAlt, 
  FaUser, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaPlus,
  FaEye
} from 'react-icons/fa';
import { HiOutlineClipboardCheck } from 'react-icons/hi';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchStats();
  }, [fetchUser, fetchStats]);


  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <FaTasks />
                TaskManager
              </Link>
              <Link
                href="/tasks"
                className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors"
              >
                <FaTasks />
                Tasks
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FaUser className="text-blue-600" />
                  <span className="font-medium">Welcome, {user.name}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:text-red-800 font-medium flex items-center gap-2 transition-colors"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FaChartLine className="text-blue-600 text-3xl" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Tasks</p>
                <p className="text-4xl font-bold text-gray-900">
                  {stats?.totalTasks || 0}
                </p>
              </div>
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center">
                <HiOutlineClipboardCheck className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                <p className="text-4xl font-bold text-green-600">
                  {stats?.completedTasks || 0}
                </p>
              </div>
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
                <p className="text-4xl font-bold text-yellow-600">
                  {stats?.pendingTasks || 0}
                </p>
              </div>
              <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center">
                <FaClock className="text-yellow-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Overdue</p>
                <p className="text-4xl font-bold text-red-600">
                  {stats?.overdueTasks || 0}
                </p>
              </div>
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tasks"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FaEye />
              View All Tasks
            </Link>
            <Link
              href="/tasks?new=true"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FaPlus />
              Create New Task
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
