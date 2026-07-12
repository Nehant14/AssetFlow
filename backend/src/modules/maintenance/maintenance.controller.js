const maintenanceService = require('./maintenance.service');

exports.raiseRequest = async (req, res) => {
  try {
    const item = await maintenanceService.createMaintenanceRequest({
      ...req.body,
      requesterId: req.user.id
    });
    res.status(201).json({ status: 'success', data: item });
  } catch (err) { 
    res.status(400).json({ status: 'error', message: err.message }); 
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const record = await maintenanceService.updateMaintenanceStatus(id, status);
    res.status(200).json({ status: 'success', data: record });
  } catch (err) { 
    res.status(400).json({ status: 'error', message: err.message }); 
  }
};