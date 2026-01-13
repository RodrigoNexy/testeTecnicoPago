import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { setupDependencies } from './config/dependencies.js';
import { container } from './config/container.js';
import { CepResult } from './models/CepResult.js';

dotenv.config();
setupDependencies();

class CepWorker {
  constructor(queueService, viaCepService, crawlService, rateLimiter) {
    if (!queueService || !viaCepService || !crawlService || !rateLimiter) {
      throw new Error('All services are required');
    }
    this.queueService = queueService;
    this.viaCepService = viaCepService;
    this.crawlService = crawlService;
    this.rateLimiter = rateLimiter;
    this.running = false;
    this.maxRetries = 3;
  }

  async start() {
    console.log('Worker iniciado');
    this.running = true;
    await this.processQueue();
  }

  async processQueue() {
    while (this.running) {
      try {
        const messages = await this.queueService.receiveMessages(1, 20);

        if (messages.length === 0) {
          continue;
        }

        for (const message of messages) {
          await this.processMessage(message);
        }
      } catch (error) {
        console.error('Erro ao processar fila:', error.message);
        await this.sleep(5000);
      }
    }
  }

  async processMessage(message) {
    let parsedBody;
    
    try {
      parsedBody = JSON.parse(message.Body);
    } catch (error) {
      console.error('Erro ao parsear mensagem:', error.message);
      await this.queueService.deleteMessage(message.ReceiptHandle);
      return;
    }

    const { crawl_id, cep } = parsedBody;

    if (!crawl_id || !cep) {
      console.error('Mensagem inválida:', parsedBody);
      await this.queueService.deleteMessage(message.ReceiptHandle);
      return;
    }

    try {
      await this.rateLimiter.execute(async () => {
        return await this.fetchAndSaveCep(crawl_id, cep);
      });

      await this.queueService.deleteMessage(message.ReceiptHandle);
    } catch (error) {
      console.error(`Erro ao processar CEP ${cep}:`, error.message);
      
      const retryCount = parseInt(message.Attributes?.ApproximateReceiveCount || '0');
      
      if (retryCount < this.maxRetries) {
        console.log(`Reenfileirando CEP ${cep} (tentativa ${retryCount + 1}/${this.maxRetries})`);
      } else {
        await this.saveError(crawl_id, cep, error.message);
        await this.queueService.deleteMessage(message.ReceiptHandle);
      }
    }
  }

  async fetchAndSaveCep(crawlId, cep) {
    const result = await this.viaCepService.fetchCep(cep);

    const cepResult = new CepResult({
      crawl_id: crawlId,
      cep,
      success: result.success,
      ...(result.success ? { data: result.data } : { error: result.error })
    });

    await cepResult.save();

    await this.crawlService.updateProgress(crawlId, result.success);

    if (result.success) {
      console.log(`CEP ${cep} processado com sucesso`);
    } else {
      console.log(`CEP ${cep} não encontrado ou erro: ${result.error.message}`);
    }

    return result;
  }

  async saveError(crawlId, cep, errorMessage) {
    const cepResult = new CepResult({
      crawl_id: crawlId,
      cep,
      success: false,
      error: {
        message: errorMessage,
        code: 'MAX_RETRIES_EXCEEDED'
      }
    });

    await cepResult.save();
    await this.crawlService.updateProgress(crawlId, false);
    
    console.log(`CEP ${cep} falhou após ${this.maxRetries} tentativas`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    console.log('Parando worker...');
    this.running = false;
  }
}

async function startWorker() {
  await connectDatabase();

  const worker = new CepWorker(
    container.resolve('queueService'),
    container.resolve('viaCepService'),
    container.resolve('crawlService'),
    container.resolve('rateLimiter')
  );

  process.on('SIGTERM', async () => {
    console.log('SIGTERM recebido, encerrando worker...');
    worker.stop();
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT recebido, encerrando worker...');
    worker.stop();
    await disconnectDatabase();
    process.exit(0);
  });

  await worker.start();
}

startWorker().catch(console.error);