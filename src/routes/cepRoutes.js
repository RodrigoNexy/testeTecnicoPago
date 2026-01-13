import express from 'express';
import { container } from '../config/container.js';

const router = express.Router();

router.post('/crawl', (req, res) => {
  const controller = container.resolve('crawlController');
  return controller.createCrawl(req, res);
});

router.get('/crawl/:crawl_id', (req, res) => {
  const controller = container.resolve('crawlController');
  return controller.getCrawlStatus(req, res);
});

router.get('/crawl/:crawl_id/results', (req, res) => {
  const controller = container.resolve('crawlController');
  return controller.getCrawlResults(req, res);
});

export default router;