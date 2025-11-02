const Schedule = require('../models/Schedule');

class ScheduleController {
  static async getAllSchedules(req, res) {
    try {
      const schedules = await Schedule.getAll();
      res.json(schedules);
    } catch (error) {
      console.error('Error getting schedules:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении расписаний' });
    }
  }

  static async getSchedulesByTour(req, res) {
    try {
      const { tourId } = req.params;
      const schedules = await Schedule.getByTourId(tourId);
      res.json(schedules);
    } catch (error) {
      console.error('Error getting schedules by tour:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async getAvailableSchedules(req, res) {
    try {
      const schedules = await Schedule.getAvailableSlots();
      res.json(schedules);
    } catch (error) {
      console.error('Error getting available schedules:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async getScheduleById(req, res) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.getById(id);
      if (!schedule) {
        return res.status(404).json({ message: 'Расписание не найдено' });
      }
      res.json(schedule);
    } catch (error) {
      console.error('Error getting schedule by id:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async createSchedule(req, res) {
    try {
      const { tour_id, start_datetime, end_datetime, available_slots, price_override, guide_notes } = req.body;
      
      console.log('Creating schedule:', req.body);
      
      // Валидация обязательных полей
      if (!tour_id || !start_datetime || !end_datetime || available_slots === undefined) {
        return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
      }

      const scheduleId = await Schedule.create({
        tour_id,
        start_datetime,
        end_datetime,
        available_slots,
        price_override: price_override || null,
        guide_notes: guide_notes || null
      });
      
      res.status(201).json({ id: scheduleId, message: 'Расписание создано' });
    } catch (error) {
      console.error('Error creating schedule:', error);
      res.status(500).json({ message: 'Ошибка создания расписания: ' + error.message });
    }
  }

  static async updateSchedule(req, res) {
    try {
      const { id } = req.params;
      const { tour_id, start_datetime, end_datetime, available_slots, price_override, guide_notes, status } = req.body;
      
      console.log('Updating schedule:', id, req.body);

      // Проверяем существование расписания
      const existingSchedule = await Schedule.getById(id);
      if (!existingSchedule) {
        return res.status(404).json({ message: 'Расписание не найдено' });
      }

      await Schedule.update(id, {
        tour_id: tour_id || existingSchedule.tour_id,
        start_datetime: start_datetime || existingSchedule.start_datetime,
        end_datetime: end_datetime || existingSchedule.end_datetime,
        available_slots: available_slots !== undefined ? available_slots : existingSchedule.available_slots,
        price_override: price_override !== undefined ? price_override : existingSchedule.price_override,
        guide_notes: guide_notes !== undefined ? guide_notes : existingSchedule.guide_notes,
        status: status || existingSchedule.status
      });
      
      res.json({ message: 'Расписание обновлено' });
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({ message: 'Ошибка обновления расписания: ' + error.message });
    }
  }

  static async deleteSchedule(req, res) {
    try {
      const { id } = req.params;
      
      // Проверяем существование расписания
      const existingSchedule = await Schedule.getById(id);
      if (!existingSchedule) {
        return res.status(404).json({ message: 'Расписание не найдено' });
      }

      await Schedule.delete(id);
      res.json({ message: 'Расписание удалено' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(500).json({ message: 'Ошибка удаления расписания' });
    }
  }
}

module.exports = ScheduleController;