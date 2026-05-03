const express = require('express');
const router = express.Router();
const { signup, login, getMe, getUsers } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../validators/authValidator');
const auth = require('../middleware/auth');

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.get('/me', auth, getMe);
router.get('/users', auth, getUsers);

module.exports = router;
