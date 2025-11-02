const express = require('express');
const { getProfile, updateProfile, getAllUsers, deleteUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.get('/', auth, roleCheck('admin'), getAllUsers);
router.delete('/:id', auth, roleCheck('admin'), deleteUser);

module.exports = router;