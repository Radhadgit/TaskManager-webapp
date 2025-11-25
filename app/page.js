'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTasks, 
  FaChartLine, 
  FaFilter, 
  FaUser, 
  FaSignInAlt, 
  FaUserPlus,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCode,
  FaRocket,
  FaShieldAlt,
  FaMobileAlt,
  FaCalendarAlt,
  FaBell,
  FaGraduationCap,
  FaIdCard
} from 'react-icons/fa';
import { HiOutlineClipboardCheck, HiOutlineLightningBolt } from 'react-icons/hi';
import { MdSecurity } from 'react-icons/md';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 p-2 rounded-lg"
              >
                <FaTasks className="text-white text-xl" />
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskManager
              </h1>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex gap-4"
            >
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors"
                  >
                    <FaChartLine />
                    Dashboard
                  </Link>
                  <Link
                    href="/tasks"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors"
                  >
                    <FaTasks />
                    Tasks
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors"
                  >
                    <FaSignInAlt />
                    Login
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/register"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                      <FaUserPlus />
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <HiOutlineLightningBolt className="text-lg" />
            </motion.div>
            <span>Simple. Powerful. Efficient.</span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Organize Your Life
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2"
            >
              One Task at a Time
            </motion.span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            A modern, intuitive task management application designed to help you stay
            organized, boost productivity, and achieve your goals effortlessly.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex gap-4 justify-center flex-wrap"
          >
            {!isAuthenticated && (
              <>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
                  >
                    <FaRocket />
                    Get Started Free
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 font-semibold text-lg border-2 border-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <FaSignInAlt />
                    Sign In
                  </Link>
                </motion.div>
              </>
            )}
            {isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  <FaChartLine />
                  Go to Dashboard
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white border-y border-gray-200 py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100%', label: 'Free to Use', color: 'blue' },
              { value: '24/7', label: 'Available', color: 'green' },
              { value: '∞', label: 'Unlimited Tasks', color: 'purple' },
              { value: '100%', label: 'Secure', color: 'yellow' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="cursor-default"
              >
                <div className={`text-4xl font-bold text-${stat.color}-600 mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your tasks efficiently
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              icon: HiOutlineClipboardCheck,
              title: 'Create Tasks',
              description: 'Easily create and manage your tasks with titles, descriptions, and priorities. Stay organized with a simple and intuitive interface that adapts to your workflow.',
              gradient: 'from-blue-100 to-blue-200',
              iconColor: 'text-blue-600',
            },
            {
              icon: FaChartLine,
              title: 'Track Progress',
              description: 'Monitor your progress with real-time status tracking and deadline management. Get valuable insights into your productivity with comprehensive dashboard analytics.',
              gradient: 'from-green-100 to-green-200',
              iconColor: 'text-green-600',
            },
            {
              icon: FaFilter,
              title: 'Smart Filtering',
              description: 'Filter and organize tasks by status, priority, and date range. Find what you need quickly and efficiently with advanced search capabilities.',
              gradient: 'from-purple-100 to-purple-200',
              iconColor: 'text-purple-600',
            },
            {
              icon: FaCalendarAlt,
              title: 'Deadline Management',
              description: 'Set deadlines for your tasks and never miss an important date. Get notified about upcoming deadlines and overdue tasks automatically.',
              gradient: 'from-yellow-100 to-yellow-200',
              iconColor: 'text-yellow-600',
            },
            {
              icon: MdSecurity,
              title: 'Secure & Private',
              description: 'Your data is protected with industry-standard security measures. JWT-based authentication ensures your tasks remain private and secure.',
              gradient: 'from-red-100 to-red-200',
              iconColor: 'text-red-600',
            },
            {
              icon: FaMobileAlt,
              title: 'Fully Responsive',
              description: 'Access your tasks from any device - desktop, tablet, or mobile. Our responsive design ensures a seamless experience across all screen sizes.',
              gradient: 'from-indigo-100 to-indigo-200',
              iconColor: 'text-indigo-600',
            },
          ].map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-gradient-to-br ${feature.gradient} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}
                >
                  <IconComponent className={`${feature.iconColor} text-3xl`} />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Developer Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <FaCode className="text-3xl" />
              <h2 className="text-3xl font-bold">Developed By</h2>
            </motion.div>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl border border-white/20"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center border-4 border-white/30">
                  <FaUser className="text-white text-4xl" />
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold mb-4"
              >
                Radha Deshmukh
              </motion.p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 10, scale: 1.05 }}
                  className="flex items-center justify-center gap-3 bg-white/10 rounded-lg px-6 py-3 backdrop-blur-sm"
                >
                  <FaGraduationCap className="text-xl" />
                  <span className="text-lg font-semibold">MCA Div A</span>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 10, scale: 1.05 }}
                  className="flex items-center justify-center gap-3 bg-white/10 rounded-lg px-6 py-3 backdrop-blur-sm"
                >
                  <FaIdCard className="text-xl" />
                  <span className="text-lg font-semibold">Roll No: 2401041</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
          >
            {/* Brand Section */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-blue-600 p-2 rounded-lg"
                >
                  <FaTasks className="text-white text-xl" />
                </motion.div>
                <h3 className="text-xl font-bold">TaskManager</h3>
              </div>
              <p className="text-gray-400 mb-4">
                A modern task management application to help you stay organized and productive.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                {!isAuthenticated && (
                  <>
                    <li>
                      <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                        Register
                      </Link>
                    </li>
                  </>
                )}
                {isAuthenticated && (
                  <>
                    <li>
                      <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/tasks" className="text-gray-400 hover:text-white transition-colors">
                        Tasks
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* Developer Info */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FaCode />
                </motion.div>
                Developer
              </h4>
              <div className="space-y-3">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <FaUser className="text-blue-500" />
                  <span>Vivek Kamble</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <FaGraduationCap className="text-green-500" />
                  <span>MCA Div A</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <FaIdCard className="text-purple-500" />
                  <span>Roll No: 2401084</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="border-t border-gray-800 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-center md:text-left">
                © 2024 TaskManager. All rights reserved.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-gray-400 text-sm"
              >
                <FaCode className="text-blue-500" />
                <span>Developed with ❤️ by Vivek Kamble</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
