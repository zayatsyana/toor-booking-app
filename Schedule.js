const pool = require('../config/database');

class Schedule {
  static async create({ tour_id, start_datetime, end_datetime, available_slots, price_override, guide_notes }) {
    const [result] = await pool.execute(
      `INSERT INTO schedules (tour_id, start_datetime, end_datetime, available_slots, price_override, guide_notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [tour_id, start_datetime, end_datetime, available_slots, price_override, guide_notes]
    );
    return result.insertId;
  }

  static async getByTourId(tour_id) {
    const [rows] = await pool.execute(
      `SELECT s.*, t.title as tour_title, t.base_price
       FROM schedules s 
       JOIN tours t ON s.tour_id = t.id 
       WHERE s.tour_id = ? AND s.status = 'scheduled'
       ORDER BY s.start_datetime ASC`,
      [tour_id]
    );
    return rows;
  }

  static async getAvailableSlots() {
    const [rows] = await pool.execute(
      `SELECT s.*, t.title, t.base_price, t.max_participants 
       FROM schedules s 
       JOIN tours t ON s.tour_id = t.id 
       WHERE s.available_slots > 0 AND s.status = 'scheduled' 
       AND s.start_datetime > NOW()
       ORDER BY s.start_datetime ASC`
    );
    return rows;
  }

  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT s.*, t.title as tour_title 
      FROM schedules s 
      JOIN tours t ON s.tour_id = t.id 
      ORDER BY s.start_datetime DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      `SELECT s.*, t.title as tour_title, t.base_price
       FROM schedules s 
       JOIN tours t ON s.tour_id = t.id 
       WHERE s.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, { tour_id, start_datetime, end_datetime, available_slots, price_override, guide_notes, status }) {
    // Обрабатываем undefined значения
    const safePriceOverride = price_override === undefined ? null : price_override;
    const safeGuideNotes = guide_notes === undefined ? null : guide_notes;
    const safeStatus = status || 'scheduled';

    await pool.execute(
      `UPDATE schedules SET 
       tour_id = ?, start_datetime = ?, end_datetime = ?, available_slots = ?, 
       price_override = ?, guide_notes = ?, status = ? 
       WHERE id = ?`,
      [tour_id, start_datetime, end_datetime, available_slots, safePriceOverride, safeGuideNotes, safeStatus, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM schedules WHERE id = ?', [id]);
  }
}

module.exports = Schedule;