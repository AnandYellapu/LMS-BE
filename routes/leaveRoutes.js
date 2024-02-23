// leaveRoutes.js

const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/leave/create - Create a new leave request
router.post('/create', authMiddleware.authenticateToken, leaveController.createLeaveRequest);

// GET /api/leave/user - Get all leave requests of the authenticated user
router.get('/', authMiddleware.authenticateToken, leaveController.getUserLeaveRequests);

// GET /api/leave/all - Get all leave requests (for managers or admins)
router.get('/all-list', authMiddleware.authenticateToken, leaveController.getAllLeaveRequests);

// PUT /api/leave/:leaveId/status - Update the status of a leave request
router.put('/:leaveId/status', authMiddleware.authenticateToken, leaveController.updateLeaveRequestStatus);

// PUT /api/leave/:leaveId/update - Update a leave request
router.put('/:leaveId/update', authMiddleware.authenticateToken, leaveController.editLeaveRequest);

module.exports = router;
