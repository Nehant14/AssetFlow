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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-lg font-bold text-ink mb-5">System Alerts &amp; Notifications</h1>
      <div className="space-y-3">
        {notifications.length === 0 && <p className="text-ink-faint text-sm">No new notifications.</p>}
        {notifications.map(notif => (
          <div key={notif.id} className="card p-4 flex justify-between items-center border-l-2 !border-l-warn">
            <div>
              {/* Used to display email reminders for expiring licenses or maintenance alerts */}
              <h3 className="font-semibold text-ink text-sm">{notif.title}</h3>
              <p className="text-sm text-ink-dim mt-0.5">{notif.message}</p>
            </div>
            <button onClick={() => handleRead(notif.id)} className="link-action shrink-0 ml-4">
              Mark as Read
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
