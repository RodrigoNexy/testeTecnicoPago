import { Crawl } from '../models/Crawl.js';
import { CepResult } from '../models/CepResult.js';
import { v4 as uuidv4 } from 'uuid';

export class CrawlService {
  constructor(queueService) {
    if (!queueService) {
      throw new Error('QueueService is required');
    }
    this.queueService = queueService;
  }

  generateCepRange(start, end) {
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    const range = [];

    for (let cep = startNum; cep <= endNum; cep++) {
      range.push(cep.toString().padStart(8, '0'));
    }

    return range;
  }

  validateCep(cep) {
    return /^\d{8}$/.test(cep);
  }

  validateRange(cepStart, cepEnd, maxRange = 10000) {
    if (!this.validateCep(cepStart)) {
      return { valid: false, error: 'cep_start deve ter 8 dígitos numéricos' };
    }

    if (!this.validateCep(cepEnd)) {
      return { valid: false, error: 'cep_end deve ter 8 dígitos numéricos' };
    }

    const startNum = parseInt(cepStart, 10);
    const endNum = parseInt(cepEnd, 10);

    if (startNum > endNum) {
      return { valid: false, error: 'cep_start deve ser menor ou igual a cep_end' };
    }

    const rangeSize = endNum - startNum + 1;
    if (rangeSize > maxRange) {
      return { valid: false, error: `Range máximo permitido: ${maxRange} CEPs` };
    }

    return { valid: true };
  }

  async createCrawl(cepStart, cepEnd) {
    const validation = this.validateRange(cepStart, cepEnd);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const crawlId = uuidv4();
    const cepRange = this.generateCepRange(cepStart, cepEnd);
    const total = cepRange.length;

    const crawl = new Crawl({
      crawl_id: crawlId,
      cep_start: cepStart,
      cep_end: cepEnd,
      total,
      status: 'pending'
    });

    await crawl.save();

    const messages = cepRange.map(cep => ({
      crawl_id: crawlId,
      cep
    }));

    await this.queueService.sendBatch(messages);

    crawl.status = 'running';
    await crawl.save();

    return {
      crawl_id: crawlId,
      total
    };
  }

  async getCrawlStatus(crawlId) {
    const crawl = await Crawl.findOne({ crawl_id: crawlId });
    
    if (!crawl) {
      return null;
    }

    return {
      crawl_id: crawl.crawl_id,
      total: crawl.total,
      processed: crawl.processed,
      successes: crawl.successes,
      errors: crawl.errors,
      status: crawl.status,
      created_at: crawl.created_at,
      updated_at: crawl.updated_at
    };
  }

  async updateProgress(crawlId, success) {
    const update = {
      $inc: {
        processed: 1,
        ...(success ? { successes: 1 } : { errors: 1 })
      }
    };

    const crawl = await Crawl.findOneAndUpdate(
      { crawl_id: crawlId },
      update,
      { new: true }
    );

    if (!crawl) {
      return;
    }

    if (crawl.processed === crawl.total) {
      crawl.status = crawl.errors === crawl.total ? 'failed' : 'finished';
      await crawl.save();
    }
  }

  async getCrawlResults(crawlId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      CepResult.find({ crawl_id: crawlId })
        .sort({ processed_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CepResult.countDocuments({ crawl_id: crawlId })
    ]);

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}