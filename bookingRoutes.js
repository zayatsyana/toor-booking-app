const express = require('express');
const { 
  createBooking, 
  getUserBookings, 
  updateStatus, 
  deleteBooking,
  getAllBookings,
  updateBooking 
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.get('/', auth, roleCheck('admin', 'operator'), getAllBookings);
router.post('/', auth, createBooking);
router.get('/my', auth, getUserBookings);
router.put('/:id', auth, updateBooking);
router.put('/:id/status', auth, roleCheck('operator', 'admin'), updateStatus);
router.delete('/:id', auth, deleteBooking);

module.exports = router;