const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName:{
    type:String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  comments: [{
    comment: {
      type: String,
      required: true
    },
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  type: {
    type: String,
    enum: ['vacation', 'sick leave', 'personal leave', 'maternity leave', 'paternity leave', 'bereavement leave', 'unpaid leave', 'compensatory leave', 'jury duty', 'others'],
    required: true
  },
  substitute: {
    type: String
  },
  numberOfDays: {
    type: Number,
    required: true
  },
}, { timestamps: true });

// Populate the comments with the User model to replace userId with username
leaveSchema.pre('find', function(next) {
  this.populate('comments.commentedBy', 'username');
  next();
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
