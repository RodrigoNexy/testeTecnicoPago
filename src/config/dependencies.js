import { container } from './container.js';
import { QueueService } from '../services/QueueService.js';
import { ViaCepService } from '../services/ViaCepService.js';
import { CrawlService } from '../services/CrawlService.js';
import { RateLimiter } from '../services/RateLimiter.js';
import { CrawlController } from '../controllers/CrawlController.js';
import { config } from './env.js';

export function setupDependencies() {
  container.register('queueService', () => new QueueService(), { singleton: true });
  
  container.register('viaCepService', () => new ViaCepService(), { singleton: true });
  
  container.register('rateLimiter', () => new RateLimiter(config.rateLimitRps || 10), { singleton: true });
  
  container.register('crawlService', (c) => new CrawlService(c.resolve('queueService')), { singleton: true });
  
  container.register('crawlController', (c) => new CrawlController(c.resolve('crawlService')));
}
