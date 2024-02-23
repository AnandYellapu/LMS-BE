
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/register - Register a new user
router.post('/register', userController.registerUser);

// POST /api/users/login - Login user
router.post('/login', userController.loginUser);

// Route to handle forgot password request
router.post('/forgot-password', userController.forgotPassword);

// Route to handle reset password request
router.post('/reset-password', userController.resetPassword);



module.exports = router;
