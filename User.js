const pool = require('../config/database');

class User {
  static async create({ email, password_hash, first_name, last_name, phone }) {
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES (?, ?, ?, ?, ?, 'client')`,
      [email, password_hash, first_name, last_name, phone]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateProfile(id, { first_name, last_name, phone }) {
    await pool.execute(
      `UPDATE users SET first_name=?, last_name=?, phone=?, updated_at=NOW() WHERE id=?`,
      [first_name, last_name, phone, id]
    );
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT id, email, first_name, last_name, phone, role FROM users');
    return rows;
  }

  static async delete(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = User;