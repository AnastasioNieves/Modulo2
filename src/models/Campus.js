const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    ciudad: {
      type: String,
      required: true,
      trim: true
    },
    direccion: {
      type: String,
      trim: true
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

campusSchema.index({ ciudad: 1, nombre: 1 });

module.exports = mongoose.model('Campus', campusSchema);
