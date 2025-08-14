
'use client';

import { MdDelete } from 'react-icons/md';
import { useEffect, useRef, useState } from 'react';
import { NotificationIcon } from '@/utils/svgicons';
import animationData from '@/lotties/notification.json';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { clearAllNotifications, deleteSingleAlert } from '@/services/admin/admin-service';
import { updateReadStatus } from '@/services/therapist/therapist-service.';
import Lottie from 'lottie-react';

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationProps {
  data: {
    otherAlerts?: Notification[];
    newChatAlerts?: Notification[];
  } | null;
  id?: string;
}

export const LottieNotification: React.FC<NotificationProps> = ({ data, id }) => {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Validate props and prepare alerts array
  const otherAlerts = Array.isArray(data?.otherAlerts) ? data.otherAlerts : [];
  const newChatAlerts = Array.isArray(data?.newChatAlerts) ? data.newChatAlerts : [];
  const alertsArray = [...otherAlerts, ...newChatAlerts];

  // Check for unread alerts
  useEffect(() => {
    setHasUnreadAlerts(alertsArray.some((alert) => !alert.read));
  }, [alertsArray]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAlertModal(false);
      }
    };

    if (showAlertModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAlertModal]);

  // Track mount status
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleRead = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const unreadAlertIds = alertsArray
        .filter((alert) => !alert.read)
        .map((alert) => alert._id);

      const response = await updateReadStatus(`/therapist/notifications/${id}`, unreadAlertIds);

      if (response?.status === 200) {
        toast.success('All notifications marked as read');
        router.refresh();
        setShowAlertModal(false);
      } else {
        toast.error('Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('An error occurred while marking notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    setIsLoading(true);
    try {
      const response = await deleteSingleAlert(`/therapist/notifications/${alertId}`);
      if (response?.status === 200) {
        toast.success('Notification deleted successfully');
        router.refresh();
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('An error occurred while deleting notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await clearAllNotifications(`/therapist/notifications/${id}/anyone who can help me with this errorclearNotifications`);
      if (response?.status === 200) {
        toast.success('All notifications deleted successfully');
        router.refresh();
        setShowAlertModal(false);
      } else {
        toast.error('Failed to delete notifications');
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error('An error occurred while deleting notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <div onClick={() => setShowAlertModal(!showAlertModal)} className='cursor-pointer'>
        {hasUnreadAlerts && isMounted ? (
          <Lottie animationData={animationData} loop={true} autoplay={true} style={{ height: 60, width: 60 }} />
        ) : (
          <NotificationIcon />
        )}
      </div>

      {showAlertModal && (
        <div className='absolute right-0 top-full mt-2 w-[340px] bg-white rounded-lg z-10 shadow-md border'>
          <div className='max-h-[500px] overflow-y-auto overflo-custom'>
            <div className='bg-[#283C63] rounded-t-lg flex justify-between items-center px-3 py-3 border-b border-[#ccc]'>
              <h5 className='text-[#fff] text-sm select-none'>Notifications</h5>
              <div className='flex gap-2'>
                <button
                  onClick={handleClearAll}
                  disabled={isLoading || !alertsArray.length}
                  className='text-xs text-[#fff] underline disabled:opacity-50'
                >
                  {isLoading ? 'Deleting...' : 'Delete All'}
                </button>
                <button
                  onClick={handleRead}
                  disabled={isLoading || !hasUnreadAlerts}
                  className='text-xs text-[#fff] underline disabled:opacity-50'
                >
                  {isLoading ? 'Updating...' : 'Mark all as Read'}
                </button>
              </div>
            </div>

            {alertsArray.length > 0 ? (
              <div>
                {alertsArray.map((row) => (
                  <div
                    key={row._id}
                    className={`border-b border-[#D9DCE2] last:border-b-0 px-3 py-2 ${row.read ? '' : 'font-bold bg-[#CCE9FA]'}`}
                  >
                    <div className='flex items-center'>
                      <div className='flex justify-between w-full'>
                        <div className='w-full'>
                          <div className={`flex justify-between w-[90%] text-sm text-[#686c78] ${row.read ? '' : 'bg-[#CCE9FA]'}`}>
                            <p className='font-semibold'>{row.message}</p>
                            <p className='min-w-[20%]'>{new Date(row.createdAt).toLocaleDateString('en-US')}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(row._id)}
                          disabled={isLoading}
                          className='mr-2 text-red-500 disabled:opacity-50'
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-center py-4'>No notifications found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};