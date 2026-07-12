import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../../api/notifications.api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlerts();
  }, []);

  const handleRead = async (id) => {
    await markAsRead(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">System Alerts & Notifications</h1>
      <div className="space-y-3">
        {notifications.length === 0 && <p>No new notifications.</p>}
        {notifications.map(notif => (
          <div key={notif.id} className="bg-white p-4 shadow rounded flex justify-between items-center border-l-4 border-yellow-500">
            <div>
              {/* Used to display email reminders for expiring licenses or maintenance alerts[cite: 2] */}
              <h3 className="font-semibold">{notif.title}</h3>
              <p className="text-sm text-gray-600">{notif.message}</p>
            </div>
            <button onClick={() => handleRead(notif.id)} className="text-blue-600 text-sm hover:underline">
              Mark as Read
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;