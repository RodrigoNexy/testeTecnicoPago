export class CrawlController {
  constructor(crawlService) {
    if (!crawlService) {
      throw new Error('CrawlService is required');
    }
    this.crawlService = crawlService;
  }

  async createCrawl(req, res) {
    try {
      const { cep_start, cep_end } = req.body;

      if (!cep_start || !cep_end) {
        return res.status(400).json({
          error: 'cep_start e cep_end são obrigatórios'
        });
      }

      const { crawl_id, total } = await this.crawlService.createCrawl(cep_start, cep_end);

      return res.status(202).json({
        crawl_id,
        total
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message
      });
    }
  }

  async getCrawlStatus(req, res) {
    try {
      const { crawl_id } = req.params;
      const status = await this.crawlService.getCrawlStatus(crawl_id);

      if (!status) {
        return res.status(404).json({
          error: 'Crawl não encontrado'
        });
      }

      return res.status(200).json(status);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar status do crawl'
      });
    }
  }

  async getCrawlResults(req, res) {
    try {
      const { crawl_id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const status = await this.crawlService.getCrawlStatus(crawl_id);
      if (!status) {
        return res.status(404).json({
          error: 'Crawl não encontrado'
        });
      }

      const result = await this.crawlService.getCrawlResults(crawl_id, page, limit);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar resultados do crawl'
      });
    }
  }
}