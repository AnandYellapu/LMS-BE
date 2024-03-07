const Leave = require('../models/Leave');

// Controller function to create a leave request
const createLeaveRequest = async (req, res) => {
  try {
    const { userName, startDate, endDate, reason, type, numberOfDays, substitute } = req.body;
    const userId = req.user._id; // Assuming the authenticated user's ID is attached to the request

    const newLeaveRequest = new Leave({
      user: userId,
      userName,
      startDate,
      endDate,
      reason,
      type,
      numberOfDays,
      substitute
    });

    await newLeaveRequest.save();
    res.status(201).json({ message: 'Leave request created successfully', leaveRequest: newLeaveRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to get all leave requests of a user
const getUserLeaveRequests = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the authenticated user's ID is attached to the request

    const leaveRequests = await Leave.find({ user: userId });
    res.status(200).json({ leaveRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to get all leave requests (for managers or admins)
const getAllLeaveRequests = async (req, res) => {
  try {
    // Check if the authenticated user is a manager or admin
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Retrieve all leave requests from the database
    const leaveRequests = await Leave.find();
    res.status(200).json({ leaveRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateLeaveRequestStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, comment } = req.body;

    const leaveRequest = await Leave.findById(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leaveRequest.status = status;
    if (comment) {
      // Add comment to the leave request
      leaveRequest.comments.push({ comment, commentedBy: req.user._id });
    }
    await leaveRequest.save();

    res.status(200).json({ message: 'Leave request updated successfully', leaveRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const editLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { startDate, endDate, reason, type, numberOfDays, substitute } = req.body;

    const leaveRequest = await Leave.findById(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Update leave request properties if provided in the request body
    if (startDate) leaveRequest.startDate = startDate;
    if (endDate) leaveRequest.endDate = endDate;
    if (reason) leaveRequest.reason = reason;
    if (type) leaveRequest.type = type;
    if (numberOfDays) leaveRequest.numberOfDays = numberOfDays;
    if (substitute) leaveRequest.substitute = substitute;

    await leaveRequest.save();

    res.status(200).json({ message: 'Leave request updated successfully', leaveRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// // Controller function to delete a leave request
// const deleteLeaveRequest = async (req, res) => {
//   try {
//     const { leaveId } = req.params;

//     const deletedLeaveRequest = await Leave.findByIdAndDelete(leaveId);
//     if (!deletedLeaveRequest) {
//       return res.status(404).json({ message: 'Leave request not found' });
//     }

//     res.status(200).json({ message: 'Leave request deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// Controller function to delete a leave request
const deleteLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;

    // Check if the authenticated user is an admin or manager
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      // If the user is an admin or manager, delete the leave request by ID
      const deletedLeaveRequest = await Leave.findByIdAndDelete(leaveId);
      if (!deletedLeaveRequest) {
        return res.status(404).json({ message: 'Leave request not found' });
      }

      return res.status(200).json({ message: 'Leave request deleted successfully' });
    } else {
      // If the user is not an admin or manager, check if they are deleting their own request
      const userId = req.user._id;
      const deletedLeaveRequest = await Leave.findOneAndDelete({ _id: leaveId, user: userId });
      if (!deletedLeaveRequest) {
        return res.status(404).json({ message: 'Leave request not found or unauthorized to delete' });
      }

      return res.status(200).json({ message: 'Leave request deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Controller function to delete all leave requests (for admins and managers)
const deleteAllLeaveRequests = async (req, res) => {
  try {
    // Check if the authenticated user is an admin or manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Delete all leave requests from the database
    await Leave.deleteMany({});
    res.status(200).json({ message: 'All leave requests deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createLeaveRequest,
  getUserLeaveRequests,
  getAllLeaveRequests,
  updateLeaveRequestStatus,
  editLeaveRequest,
  deleteLeaveRequest,
  deleteAllLeaveRequests,
};
