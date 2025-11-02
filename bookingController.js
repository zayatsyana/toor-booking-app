const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const Tour = require('../models/Tour');

class BookingController {
  static async getAllBookings(req, res) {
    try {
      const bookings = await Booking.getAll();
      res.json(bookings);
    } catch (error) {
      console.error('Error getting all bookings:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении бронирований' });
    }
  }

  static async getUserBookings(req, res) {
    try {
      const bookings = await Booking.getByUser(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error('Error getting user bookings:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async createBooking(req, res) {
    try {
      const { schedule_id, participants_count, special_requests } = req.body;
      
      console.log('Creating booking with data:', { 
        user_id: req.user.id, 
        schedule_id, 
        participants_count, 
        special_requests 
      });

      // Валидация
      if (!schedule_id || !participants_count) {
        return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
      }

      // Проверяем доступность расписания
      const schedule = await Schedule.getById(schedule_id);
      if (!schedule) {
        return res.status(404).json({ message: 'Расписание не найдено' });
      }

      if (schedule.available_slots < participants_count) {
        return res.status(400).json({ message: 'Недостаточно свободных мест' });
      }

      // Получаем тур для расчета цены
      const tour = await Tour.getById(schedule.tour_id);
      if (!tour) {
        return res.status(404).json({ message: 'Тур не найден' });
      }

      // Рассчитываем цену
      const pricePerPerson = schedule.price_override || tour.base_price;
      const total_price = pricePerPerson * participants_count;

      console.log('Calculated total price:', total_price);

      const bookingId = await Booking.create({
        user_id: req.user.id,
        schedule_id,
        participants_count,
        total_price,
        special_requests: special_requests || null
      });

      // Обновляем количество доступных мест
      await Schedule.update(schedule_id, {
        tour_id: schedule.tour_id,
        start_datetime: schedule.start_datetime,
        end_datetime: schedule.end_datetime,
        available_slots: schedule.available_slots - participants_count,
        price_override: schedule.price_override,
        guide_notes: schedule.guide_notes,
        status: schedule.status
      });

      res.status(201).json({ id: bookingId, message: 'Бронирование создано' });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Ошибка создания бронирования: ' + error.message });
    }
  }

  static async updateBooking(req, res) {
    try {
      const { id } = req.params;
      const { participants_count, special_requests } = req.body;

      // Проверяем существование бронирования
      const existingBooking = await Booking.getById(id);
      if (!existingBooking) {
        return res.status(404).json({ message: 'Бронирование не найдено' });
      }

      // Проверяем права доступа
      if (existingBooking.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'operator') {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }

      await Booking.update(id, {
        participants_count,
        special_requests: special_requests || null
      });

      res.json({ message: 'Бронирование обновлено' });
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ message: 'Ошибка обновления бронирования' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, cancellation_reason } = req.body;

      const existingBooking = await Booking.getById(id);
      if (!existingBooking) {
        return res.status(404).json({ message: 'Бронирование не найдено' });
      }

      await Booking.updateStatus(id, status, cancellation_reason || null);
      res.json({ message: 'Статус бронирования обновлен' });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: 'Ошибка обновления статуса' });
    }
  }

  static async deleteBooking(req, res) {
    try {
      const { id } = req.params;

      const existingBooking = await Booking.getById(id);
      if (!existingBooking) {
        return res.status(404).json({ message: 'Бронирование не найдено' });
      }

      // Проверяем права доступа
      if (existingBooking.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'operator') {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }

      // Восстанавливаем места в расписании при отмене брони
      if (existingBooking.status === 'confirmed' || existingBooking.status === 'pending') {
        const schedule = await Schedule.getById(existingBooking.schedule_id);
        if (schedule) {
          await Schedule.update(existingBooking.schedule_id, {
            tour_id: schedule.tour_id,
            start_datetime: schedule.start_datetime,
            end_datetime: schedule.end_datetime,
            available_slots: schedule.available_slots + existingBooking.participants_count,
            price_override: schedule.price_override,
            guide_notes: schedule.guide_notes,
            status: schedule.status
          });
        }
      }

      await Booking.delete(id);
      res.json({ message: 'Бронирование удалено' });
    } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({ message: 'Ошибка удаления бронирования' });
    }
  }
}

module.exports = BookingController;