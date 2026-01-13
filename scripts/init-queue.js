import { SQSClient, CreateQueueCommand, GetQueueUrlCommand } from '@aws-sdk/client-sqs';
import { config } from '../src/config/env.js';

const client = new SQSClient({
  region: config.aws.region,
  endpoint: config.aws.endpoint,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  },
  forcePathStyle: true
});

const queueName = 'cep-queue';

async function initQueue() {
  const maxAttempts = 15;
  let attempts = 0;

  console.log('Aguardando ElasticMQ ficar totalmente pronto...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  while (attempts < maxAttempts) {
    try {
      console.log(`Tentativa ${attempts + 1}/${maxAttempts}: Tentando criar/verificar fila...`);
      
      try {
        const createQueueCommand = new CreateQueueCommand({
          QueueName: queueName,
          Attributes: {
            VisibilityTimeout: '300',
            MessageRetentionPeriod: '345600',
            ReceiveMessageWaitTimeSeconds: '20'
          }
        });

        const response = await client.send(createQueueCommand);
        console.log(`Fila criada/verificada com sucesso: ${response.QueueUrl || config.aws.sqsQueueUrl}`);
        return;
      } catch (createError) {
        if (createError.name === 'QueueAlreadyExists' || createError.Code === 'QueueAlreadyExists') {
          console.log('Fila já existe!');
          return;
        }
        
        try {
          const getQueueUrlCommand = new GetQueueUrlCommand({ QueueName: queueName });
          const response = await client.send(getQueueUrlCommand);
          console.log(`Fila já existe: ${response.QueueUrl || config.aws.sqsQueueUrl}`);
          return;
        } catch (getError) {
          throw createError;
        }
      }
    } catch (error) {
      attempts++;
      const errorMsg = error.message || error.toString();
      
      if (attempts >= maxAttempts) {
        console.log('Não foi possível criar a fila antecipadamente.');
        console.log('Isso é normal - o ElasticMQ criará a fila automaticamente quando a primeira mensagem for enviada.');
        process.exit(0);
      }
      
      console.log(`Aguardando ElasticMQ... (${errorMsg.substring(0, 100)})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

initQueue();