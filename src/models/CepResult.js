import mongoose from 'mongoose';

const cepResultSchema = new mongoose.Schema({
  crawl_id: {
    type: String,
    required: true,
    index: true
  },
  cep: {
    type: String,
    required: true,
    index: true
  },
  success: {
    type: Boolean,
    required: true
  },
  data: {
    cep: String,
    logradouro: String,
    complemento: String,
    bairro: String,
    localidade: String,
    uf: String,
    ibge: String,
    gia: String,
    ddd: String,
    siafi: String
  },
  error: {
    message: String,
    code: String
  },
  processed_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

cepResultSchema.index({ crawl_id: 1, processed_at: -1 });

export const CepResult = mongoose.model('CepResult', cepResultSchema);