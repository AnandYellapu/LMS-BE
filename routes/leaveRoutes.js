// leaveRoutes.js

const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/create', authMiddleware.authenticateToken, leaveController.createLeaveRequest);


router.get('/list', authMiddleware.authenticateToken, leaveController.getUserLeaveRequests);


router.get('/all-list', authMiddleware.authenticateToken, leaveController.getAllLeaveRequests);


router.put('/:leaveId/status', authMiddleware.authenticateToken, leaveController.updateLeaveRequestStatus);


router.put('/:leaveId/update', authMiddleware.authenticateToken, leaveController.editLeaveRequest);


router.delete('/:leaveId/delete', authMiddleware.authenticateToken, leaveController.deleteLeaveRequest);

// Add route for deleting all leave requests (for admins and managers)
router.delete('/delete-all', authMiddleware.authenticateToken, leaveController.deleteAllLeaveRequests);

module.exports = router;
