const auditService = require('./audit.service');

exports.createCycle = async (req, res) => {
  try {
    const cycle = await auditService.createAuditCycle(req.body);
    res.status(201).json({ status: 'success', data: cycle });
  } catch (err) { 
    res.status(400).json({ status: 'error', message: err.message }); 
  }
};

exports.recordVerification = async (req, res) => {
  try {
    const record = await auditService.recordVerification(req.body);
    res.status(201).json({ status: 'success', data: record });
  } catch (err) { 
    res.status(400).json({ status: 'error', message: err.message }); 
  }
};

exports.closeCycle = async (req, res) => {
  try {
    await auditService.closeCycle(req.params.id);
    res.status(200).json({ status: 'success', message: 'Audit cycle locked and reconciled.' });
  } catch (err) { 
    res.status(400).json({ status: 'error', message: err.message }); 
  }
};