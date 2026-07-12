const notificationService = require('./notification.service');

exports.getDashboardKPIs = async (req, res) => {
  try {
    const data = await notificationService.getDashboardKPIs();
    res.status(200).json({ status: 'success', data });
  } catch (err) { 
    res.status(500).json({ status: 'error', message: err.message }); 
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const data = await notificationService.getNotifications(req.user.id);
    res.status(200).json({ status: 'success', data });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const data = await notificationService.markNotificationRead(req.params.id);
    res.status(200).json({ status: 'success', data });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};