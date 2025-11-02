const express = require('express');
const { createTour, getTours, getTour, updateTour, deleteTour } = require('../controllers/tourController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.get('/', getTours);
router.get('/:id', getTour);
router.post('/', auth, roleCheck('operator', 'admin'), createTour);
router.put('/:id', auth, roleCheck('operator', 'admin'), updateTour);
router.delete('/:id', auth, roleCheck('admin'), deleteTour);

module.exports = router;