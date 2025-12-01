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
  FaCode,
  FaRocket,
  FaMobileAlt,
  FaCalendarAlt,
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
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok && setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const stats = [
    { id: 1, value: '100%', label: 'Free to Use', color: 'blue' },
    { id: 2, value: '24/7', label: 'Available', color: 'green' },
    { id: 3, value: '∞', label: 'Unlimited Tasks', color: 'purple' },
    { id: 4, value: '100%', label: 'Secure', color: 'yellow' },
  ];

  const features = [
    {
      id: 1,
      icon: HiOutlineClipboardCheck,
      title: 'Create Tasks',
      description: 'Easily create and manage your tasks with titles, descriptions, and priorities. Stay organized with a simple and intuitive interface that adapts to your workflow.',
      gradient: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      id: 2,
      icon: FaChartLine,
      title: 'Track Progress',
      description: 'Monitor your progress with real-time status tracking and deadline management. Get valuable insights into your productivity with comprehensive dashboard analytics.',
      gradient: 'from-green-100 to-green-200',
      iconColor: 'text-green-600',
    },
    {
      id: 3,
      icon: FaFilter,
      title: 'Smart Filtering',
      description: 'Filter and organize tasks by status, priority, and date range. Find what you need quickly and efficiently with advanced search capabilities.',
      gradient: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      id: 4,
      icon: FaCalendarAlt,
      title: 'Deadline Management',
      description: 'Set deadlines for your tasks and never miss an important date. Get notified about upcoming deadlines and overdue tasks automatically.',
      gradient: 'from-yellow-100 to-yellow-200',
      iconColor: 'text-yellow-600',
    },
    {
      id: 5,
      icon: MdSecurity,
      title: 'Secure & Private',
      description: 'Your data is protected with industry-standard security measures. JWT-based authentication ensures your tasks remain private and secure.',
      gradient: 'from-red-100 to-red-200',
      iconColor: 'text-red-600',
    },
    {
      id: 6,
      icon: FaMobileAlt,
      title: 'Fully Responsive',
      description: 'Access your tasks from any device - desktop, tablet, or mobile. Our responsive design ensures a seamless experience across all screen sizes.',
      gradient: 'from-indigo-100 to-indigo-200',
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation and Hero Section remain unchanged */}

      {/* Stats Section */}
      <motion.div className="bg-white border-y border-gray-200 py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(stat => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: stat.id * 0.1, duration: 0.5 }}
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
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map(feature => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
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

      {/* The rest of your sections (Developer Info, Footer) remain unchanged */}
    </div>
  );
}
