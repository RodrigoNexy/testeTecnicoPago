import mongoose from 'mongoose';

export async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cep_crawler';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('MongoDB conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar MongoDB:', error.message);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}