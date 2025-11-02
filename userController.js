const User = require('../models/User');

const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
};

const updateProfile = async (req, res) => {
  const { first_name, last_name, phone } = req.body;
  await User.updateProfile(req.user.id, { first_name, last_name, phone });
  res.json({ message: 'Профиль обновлён' });
};

const getAllUsers = async (req, res) => {
  const users = await User.getAll();
  res.json(users);
};

const deleteUser = async (req, res) => {
  await User.delete(req.params.id);
  res.json({ message: 'Пользователь удалён' });
};

module.exports = { getProfile, updateProfile, getAllUsers, deleteUser };