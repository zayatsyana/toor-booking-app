const express = require('express');
const { createGuide, getGuides, updateGuide, deleteGuide, getGuideById } = require('../controllers/guideController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.get('/', getGuides);
router.get('/:id', auth, roleCheck('operator', 'admin'), getGuideById);
router.post('/', auth, roleCheck('operator', 'admin'), createGuide);
router.put('/:id', auth, roleCheck('operator', 'admin'), updateGuide);
router.delete('/:id', auth, roleCheck('admin'), deleteGuide);

module.exports = router;