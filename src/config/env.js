import dotenv from 'dotenv';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cep_crawler',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT || 'http://localhost:9324',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
    sqsQueueUrl: process.env.SQS_QUEUE_URL || 'http://localhost:9324/queue/cep-queue'
  },
  rateLimitRps: parseInt(process.env.RATE_LIMIT_RPS, 10) || 10
};

function validate() {
  const missing = [];

  if (!config.mongodbUri) missing.push('MONGODB_URI');
  if (!config.aws.sqsQueueUrl) missing.push('SQS_QUEUE_URL');

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

// Validate on import to fail fast if required vars are absent
validate();

export { config };
