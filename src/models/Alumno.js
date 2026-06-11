const mongoose = require('mongoose');

const alumnoSchema = new mongoose.Schema(
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
    telefono: {
      type: String,
      trim: true
    },
    promocion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promocion',
      required: true,
      index: true
    },
    estado: {
      type: String,
      enum: ['activo', 'riesgo', 'baja', 'egresado'],
      default: 'activo',
      index: true
    },
    fotoUrl: {
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

alumnoSchema.index({ promocion: 1, email: 1 });
alumnoSchema.index({ nombre: 'text', apellidos: 'text', email: 'text' });

module.exports = mongoose.model('Alumno', alumnoSchema);
