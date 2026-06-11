const mongoose = require('mongoose');

const promocionSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    codigo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      required: true,
      index: true
    },
    fechaInicio: Date,
    fechaFin: Date,
    modalidad: {
      type: String,
      enum: ['presencial', 'online', 'hibrida'],
      default: 'presencial'
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

promocionSchema.index({ campus: 1, codigo: 1 });

module.exports = mongoose.model('Promocion', promocionSchema);
