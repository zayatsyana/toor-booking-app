const pool = require('../config/database');

class Booking {
  static async create({ user_id, schedule_id, participants_count, total_price, special_requests }) {
    // Обрабатываем undefined значения
    const safeSpecialRequests = special_requests === undefined ? null : special_requests;
    const safeTotalPrice = total_price === undefined ? 0 : total_price;
    const safeParticipantsCount = participants_count === undefined ? 1 : participants_count;
    
    console.log('Booking.create with:', { user_id, schedule_id, participants_count: safeParticipantsCount, total_price: safeTotalPrice, special_requests: safeSpecialRequests });
    
    const [result] = await pool.execute(
      `INSERT INTO bookings (user_id, schedule_id, participants_count, total_price, special_requests, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id, schedule_id, safeParticipantsCount, safeTotalPrice, safeSpecialRequests]
    );
    return result.insertId;
  }

  static async getByUser(user_id) {
    const [rows] = await pool.execute(
      `SELECT b.*, t.title as tour_title, s.start_datetime, s.tour_id
       FROM bookings b
       JOIN schedules s ON b.schedule_id = s.id
       JOIN tours t ON s.tour_id = t.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [user_id]
    );
    return rows;
  }

  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT b.*, u.first_name, u.last_name, t.title as tour_title, s.start_datetime
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN schedules s ON b.schedule_id = s.id
      JOIN tours t ON s.tour_id = t.id
      ORDER BY b.created_at DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      `SELECT b.*, u.first_name, u.last_name, t.title as tour_title, s.start_datetime, s.tour_id
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN schedules s ON b.schedule_id = s.id
       JOIN tours t ON s.tour_id = t.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, { participants_count, special_requests }) {
    const safeSpecialRequests = special_requests === undefined ? null : special_requests;
    const safeParticipantsCount = participants_count === undefined ? 1 : participants_count;
    
    await pool.execute(
      `UPDATE bookings SET participants_count = ?, special_requests = ?, updated_at = NOW() WHERE id = ?`,
      [safeParticipantsCount, safeSpecialRequests, id]
    );
  }

  static async updateStatus(id, status, cancellation_reason = null) {
    const safeCancellationReason = cancellation_reason === undefined ? null : cancellation_reason;
    
    await pool.execute(
      `UPDATE bookings SET status = ?, cancellation_reason = ?, updated_at = NOW() WHERE id = ?`,
      [status, safeCancellationReason, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM bookings WHERE id = ?', [id]);
  }
}

module.exports = Booking;