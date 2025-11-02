const pool = require('../config/database');

class Guide {
  static async create({ full_name, experience_years, languages, bio, phone }) {

    const safeExperience = experience_years === undefined ? 0 : experience_years;
    const safeLanguages = languages === undefined ? null : languages;
    const safeBio = bio === undefined ? null : bio;
    const safePhone = phone === undefined ? null : phone;

    const [result] = await pool.execute(
      `INSERT INTO guides (full_name, experience_years, languages, bio, phone, active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [full_name, safeExperience, safeLanguages, safeBio, safePhone]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM guides WHERE active = TRUE');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM guides WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { full_name, experience_years, languages, bio, phone }) {
    const safeExperience = experience_years === undefined ? 0 : experience_years;
    const safeLanguages = languages === undefined ? null : languages;
    const safeBio = bio === undefined ? null : bio;
    const safePhone = phone === undefined ? null : phone;

    await pool.execute(
      `UPDATE guides SET full_name=?, experience_years=?, languages=?, bio=?, phone=? WHERE id=?`,
      [full_name, safeExperience, safeLanguages, safeBio, safePhone, id]
    );
  }

  static async delete(id) {
    await pool.execute('UPDATE guides SET active = FALSE WHERE id = ?', [id]);
  }
}

module.exports = Guide;