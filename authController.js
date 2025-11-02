const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;
    if (!email || !password || !first_name || !last_name)
      return res.status(400).json({ message: 'Не все поля заполнены' });

    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email уже зарегистрирован' });

    const hash = await bcrypt.hash(password, 10);
    const id = await User.create({ email, password_hash: hash, first_name, last_name, phone });
    res.status(201).json({ message: 'Пользователь создан', id });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка регистрации', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Неверный email или пароль' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка авторизации', error: err.message });
  }
};

module.exports = { register, login };