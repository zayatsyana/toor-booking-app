const express = require('express');
const { 
  createSchedule, 
  getSchedulesByTour, 
  getAvailableSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getAllSchedules
} = require('../controllers/scheduleController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.get('/', auth, roleCheck('operator', 'admin'), getAllSchedules);
router.get('/available', getAvailableSchedules);
router.get('/tour/:tourId', getSchedulesByTour);
router.get('/:id', auth, roleCheck('operator', 'admin'), getScheduleById);
router.post('/', auth, roleCheck('operator', 'admin'), createSchedule);
router.put('/:id', auth, roleCheck('operator', 'admin'), updateSchedule);
router.delete('/:id', auth, roleCheck('operator', 'admin'), deleteSchedule);

module.exports = router;