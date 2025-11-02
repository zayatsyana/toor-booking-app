const Tour = require('../models/Tour');

class TourController {
  static async createTour(req, res) {
    try {
      const { title, description, base_price, duration_hours, max_participants, location, meeting_point, requirements, guide_id } = req.body;
      
      console.log('Creating tour with data:', req.body);
      
      if (!title || base_price === undefined || max_participants === undefined) {
        return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
      }

      const tourId = await Tour.create({
        title,
        description: description || '',
        base_price,
        duration_hours: duration_hours || 2,
        max_participants,
        location: location || '',
        meeting_point: meeting_point || '',
        requirements: requirements || '',
        created_by: req.user.id,
        guide_id: guide_id || null
      });
      
      res.status(201).json({ id: tourId, message: 'Тур создан' });
    } catch (error) {
      console.error('Error creating tour:', error);
      res.status(500).json({ message: 'Ошибка создания тура: ' + error.message });
    }
  }

  static async getTours(req, res) {
    try {
      const tours = await Tour.getAll();
      res.json(tours);
    } catch (error) {
      console.error('Error getting tours:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async getTour(req, res) {
    try {
      const { id } = req.params;
      const tour = await Tour.getById(id);
      if (!tour) {
        return res.status(404).json({ message: 'Тур не найден' });
      }
      res.json(tour);
    } catch (error) {
      console.error('Error getting tour:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async updateTour(req, res) {
    try {
      const { id } = req.params;
      const { title, description, base_price, duration_hours, max_participants, location, meeting_point, requirements, guide_id } = req.body;

      console.log('Updating tour:', id, req.body);

      const existingTour = await Tour.getById(id);
      if (!existingTour) {
        return res.status(404).json({ message: 'Тур не найден' });
      }

      await Tour.update(id, {
        title: title || existingTour.title,
        description: description !== undefined ? description : existingTour.description,
        base_price: base_price !== undefined ? base_price : existingTour.base_price,
        duration_hours: duration_hours !== undefined ? duration_hours : existingTour.duration_hours,
        max_participants: max_participants !== undefined ? max_participants : existingTour.max_participants,
        location: location !== undefined ? location : existingTour.location,
        meeting_point: meeting_point !== undefined ? meeting_point : existingTour.meeting_point,
        requirements: requirements !== undefined ? requirements : existingTour.requirements,
        guide_id: guide_id !== undefined ? guide_id : existingTour.guide_id 
      });
      
      res.json({ message: 'Тур обновлен' });
    } catch (error) {
      console.error('Error updating tour:', error);
      res.status(500).json({ message: 'Ошибка обновления тура: ' + error.message });
    }
  }

  static async deleteTour(req, res) {
    try {
      const { id } = req.params;
      const existingTour = await Tour.getById(id);
      if (!existingTour) {
        return res.status(404).json({ message: 'Тур не найден' });
      }

      await Tour.delete(id);
      res.json({ message: 'Тур удален' });
    } catch (error) {
      console.error('Error deleting tour:', error);
      res.status(500).json({ message: 'Ошибка удаления тура' });
    }
  }
}

module.exports = TourController;