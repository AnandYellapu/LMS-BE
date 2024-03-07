const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');



// Controller function to register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Password strength requirements
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();

    // Email verification (send verification email here)

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to authenticate a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '48h'
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const sendResetPasswordEmail = async (email, resetToken) => {
  // Create a Nodemailer transporter using SMTP
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
      user: process.env.SMTP_USERNAME, // Your email address
      pass: process.env.SMTP_PASSWORD // Your email password
    }
  });

  // Define email options
  const mailOptions = {
    from: process.env.SMTP_USERNAME,
    to: email,
    subject: 'Password Reset',
    html: `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            body {
              font-family: 'Roboto', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #007bff;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
            }
            .logo {
              display: inline-block;
              width: 150px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              margin-bottom: 20px;
            }
            .content {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #ffffff;
              color: #007bff;
              font-size: 16px;
              border: 2px solid #007bff;
              border-radius: 4px;
              text-decoration: none;
              transition: background-color 0.3s, color 0.3s;
            }
            .button:hover {
              background-color: #007bff;
              color: #ffffff;
            }
            .footer {
              text-align: center;
              padding: 20px;
              background-color: #007bff;
              color: #ffffff;
              border-bottom-left-radius: 8px;
              border-bottom-right-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img class="logo" src="https://example.com/logo.png" alt="Leave Management System Logo">
            </div>
            <div class="content">
              <h1 class="title">Leave Management System</h1>
              <p>You have requested to reset your password. Click the button below to reset it.</p>
              <a class="button" href="https://leave-management-systm.netlify.app/reset-password/${resetToken}">Reset Password</a>
            </div>
            <div class="footer">
              <p>&copy; 2024 Leave Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent successfully');
  } catch (error) {
    console.error('Error sending reset password email:', error);
  }
};


// Controller function to handle forgot password request
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h' // Token expires in 1 hour
    });

    // Save reset token and expiry time to user document
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour in milliseconds
    await user.save();

    // Send password reset email
    await sendResetPasswordEmail(email, resetToken);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to handle reset password request
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Decode reset token to get user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken._id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if reset token is valid
    if (user.resetToken !== token || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and reset token fields
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};
