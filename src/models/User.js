const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'profesor', 'alumno'],
      required: true,
      default: 'profesor',
      index: true
    },
    profesor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profesor',
      default: null
    },
    alumno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumno',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastLoginAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
