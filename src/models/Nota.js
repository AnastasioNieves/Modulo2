const mongoose = require('mongoose');

const notaSchema = new mongoose.Schema(
  {
    alumno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumno',
      required: true,
      index: true
    },
    proyecto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proyecto',
      required: true,
      index: true
    },
    profesor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profesor',
      required: true,
      index: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    apto: {
      type: Boolean,
      default: undefined
    },
    feedback: {
      type: String,
      trim: true
    },
    actaUrl: {
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

notaSchema.index({ alumno: 1, proyecto: 1 }, { unique: true });
notaSchema.index({ proyecto: 1, apto: 1 });
notaSchema.index({ profesor: 1, deletedAt: 1 });

notaSchema.pre('validate', function setApto(next) {
  if (typeof this.apto === 'undefined' && typeof this.score === 'number') {
    this.apto = this.score >= 60;
  }
  next();
});

module.exports = mongoose.model('Nota', notaSchema);
