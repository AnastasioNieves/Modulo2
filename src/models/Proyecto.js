const mongoose = require('mongoose');

const proyectoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    modulo: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      trim: true
    },
    promocion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promocion',
      required: true,
      index: true
    },
    profesor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profesor',
      required: true,
      index: true
    },
    fechaEntrega: Date,
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

proyectoSchema.index({ promocion: 1, profesor: 1, nombre: 1 });

module.exports = mongoose.model('Proyecto', proyectoSchema);
