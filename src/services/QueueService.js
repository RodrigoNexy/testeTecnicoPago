import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '../config/env.js';

export class QueueService {
  constructor() {
    this.client = new SQSClient({
      region: config.aws.region,
      endpoint: config.aws.endpoint,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
      },
      forcePathStyle: true
    });
    this.queueUrl = config.aws.sqsQueueUrl;
  }

  async sendMessage(messageBody) {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody)
    });

    const response = await this.client.send(command);
    return response.MessageId;
  }

  async receiveMessages(maxMessages = 1, waitTimeSeconds = 20) {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: Math.min(maxMessages, 10),
      WaitTimeSeconds: waitTimeSeconds,
      AttributeNames: ['All'],
      MessageAttributeNames: ['All']
    });

    const response = await this.client.send(command);
    return response.Messages || [];
  }

  async deleteMessage(receiptHandle) {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle
    });

    await this.client.send(command);
  }

  async sendBatch(messages) {
    const promises = messages.map(msg => this.sendMessage(msg));
    return Promise.all(promises);
  }
}