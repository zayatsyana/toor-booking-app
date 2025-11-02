const pool = require('../config/database');

class Tour {
  static async create({ title, description, base_price, duration_hours, max_participants, location, meeting_point, requirements, created_by, guide_id }) {
    const safeDescription = description === undefined ? null : description;
    const safeLocation = location === undefined ? null : location;
    const safeMeetingPoint = meeting_point === undefined ? null : meeting_point;
    const safeRequirements = requirements === undefined ? null : requirements;
    const safeGuideId = guide_id === undefined ? null : guide_id;
    const safeCreatedBy = created_by === undefined ? null : created_by;
    const safeDuration = duration_hours === undefined ? 2 : duration_hours;

    const [result] = await pool.execute(
      `INSERT INTO tours (title, description, base_price, duration_hours, max_participants, location, meeting_point, requirements, created_by, guide_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [title, safeDescription, base_price, safeDuration, max_participants, safeLocation, safeMeetingPoint, safeRequirements, safeCreatedBy, safeGuideId]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT t.*, g.full_name as guide_name 
      FROM tours t 
      LEFT JOIN guides g ON t.guide_id = g.id 
      WHERE t.is_active = TRUE
    `);
    return rows;
  }

 static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT t.*, g.full_name as guide_name 
      FROM tours t 
      LEFT JOIN guides g ON t.guide_id = g.id 
      WHERE t.id = ?
    `, [id]);
    return rows[0];
  }

  static async update(id, data) {
    const { title, description, base_price, duration_hours, max_participants, location, meeting_point, requirements, guide_id } = data;
    
    const safeDescription = description === undefined ? null : description;
    const safeLocation = location === undefined ? null : location;
    const safeMeetingPoint = meeting_point === undefined ? null : meeting_point;
    const safeRequirements = requirements === undefined ? null : requirements;
    const safeGuideId = guide_id === undefined ? null : guide_id;
    const safeDuration = duration_hours === undefined ? 2 : duration_hours;

    await pool.execute(
      `UPDATE tours SET title=?, description=?, base_price=?, duration_hours=?, max_participants=?, location=?, meeting_point=?, requirements=?, guide_id=?, updated_at=NOW() WHERE id=?`,
      [title, safeDescription, base_price, safeDuration, max_participants, safeLocation, safeMeetingPoint, safeRequirements, safeGuideId, id]
    );
  }

  static async delete(id) {
    await pool.execute('UPDATE tours SET is_active = FALSE WHERE id=?', [id]);
  }
}

module.exports = Tour;