import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../QueueService.js', () => {
  const sendBatchMock = vi.fn().mockResolvedValue([]);
  class MockQueueService {
    constructor() {
      MockQueueService.instance = this;
    }
    async sendBatch(messages) {
      return sendBatchMock(messages);
    }
  }
  MockQueueService._sendBatchMock = sendBatchMock;
  return { QueueService: MockQueueService };
});

vi.mock('../../models/Crawl.js', () => {
  return {
    Crawl: vi.fn().mockImplementation(function (props) {
      this.props = props;
      this.save = vi.fn().mockResolvedValue(this);
    })
  };
});

vi.mock('uuid', () => ({ v4: () => 'fixed-crawl-id' }));

let CrawlService;
let mockQueueService;

describe('CrawlService - unit', () => {
  let service;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../CrawlService.js');
    CrawlService = mod.CrawlService;
    
    const { QueueService } = await import('../QueueService.js');
    mockQueueService = new QueueService();
    
    service = new CrawlService(mockQueueService);
  });

  it('validateRange should validate good ranges', () => {
    const result = service.validateRange('01000000', '01000005', 10000);
    expect(result.valid).toBe(true);
  });

  it('validateRange should reject invalid CEP formats', () => {
    const r1 = service.validateRange('abc', '01000005');
    expect(r1.valid).toBe(false);

    const r2 = service.validateRange('01000000', '1');
    expect(r2.valid).toBe(false);
  });

  it('validateRange should reject start > end', () => {
    const r = service.validateRange('01000010', '01000005');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/cep_start deve ser menor/);
  });

  it('generateCepRange should create padded sequence', () => {
    const arr = service.generateCepRange('01000000', '01000003');
    expect(arr).toEqual(['01000000', '01000001', '01000002', '01000003']);
  });

  it('createCrawl should create crawl and enqueue messages', async () => {
    const res = await service.createCrawl('01000000', '01000002');

    expect(res.crawl_id).toBe('fixed-crawl-id');
    expect(res.total).toBe(3);

    const { QueueService } = await import('../QueueService.js');
    expect(QueueService._sendBatchMock).toHaveBeenCalled();

    const messages = QueueService._sendBatchMock.mock.calls[0][0];
    expect(messages.length).toBe(3);
    expect(messages[0].crawl_id).toBe('fixed-crawl-id');
  });
});
