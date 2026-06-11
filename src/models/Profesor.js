const mongoose = require('mongoose');

const profesorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellidos: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    especialidad: {
      type: String,
      trim: true
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      required: true,
      index: true
    },
    promociones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promocion'
      }
    ],
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

profesorSchema.index({ campus: 1, email: 1 });

module.exports = mongoose.model('Profesor', profesorSchema);
