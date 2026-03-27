// ================ IMPORTS ================
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectNotificationService } from '../services/projectNotificationService';
import { db } from '../services/firebase';
import ui from '../translations/ui.js';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc 
} from 'firebase/firestore';

// ================ NOTIFICATION BELL COMPONENT ================
const NotificationBell = ({ handlePageChange }) => {
  // ===== State Management =====
  const [isOpen, setIsOpen] = useState(false);
  const { user, language } = useAuth();
  const t = (ui[language] || ui.en).notifications;
  const containerRef = useRef(null);
  const queryClient = useQueryClient();

  // ===== Notifications Query =====
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', user?.uid],
    queryFn: async () => {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipients', 'array-contains', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate()
      }));
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 30,
  });

  // ===== Unread Count Query =====
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount', user?.uid],
    queryFn: async () => {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      return userDoc.data()?.unreadNotifications || 0;
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 30,
  });

  // ===== Mark As Read Mutation =====
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => 
      projectNotificationService.markNotificationAsRead(notificationId, user.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // ===== Event Handlers =====
  const handleNotificationClick = async (notification) => {
    try {
      await markAsReadMutation.mutateAsync(notification.id);
      handlePageChange('forum');
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  // ===== Effects =====
  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.uid] });
    }
  }, [isOpen, queryClient, user?.uid]);

  // ===== Render Guard =====
  if (!user) return null;

  // ===== Render Component =====
  return (
    <div 
      className="relative"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell className="w-6 h-6" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute right-0 w-80 mt-2 bg-white rounded-lg shadow-lg z-50"
          >
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">{t.title}</h3>
              <div className="space-y-4">
                {error ? (
                  <p className="text-red-500 text-center">Error: {error.message}</p>
                ) : isLoading ? (
                  <div className="text-center py-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
                    />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-gray-500 text-center">{t.noNotifications}</p>
                ) : (
                  <motion.div layout className="space-y-2">
                    {notifications.map(notification => (
                      <motion.div
                        layout
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.timestamp.toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
