const authService = require('./auth.service');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({ status: 'success', data: user });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};