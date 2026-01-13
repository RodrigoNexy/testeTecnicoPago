export class RateLimiter {
  constructor(requestsPerSecond = 10) {
    this.requestsPerSecond = requestsPerSecond;
    this.minInterval = 1000 / requestsPerSecond;
    this.lastRequestTime = 0;
    this.queue = [];
    this.processing = false;
  }

  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this._processQueue();
    });
  }

  async _processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.minInterval) {
        await this._sleep(this.minInterval - timeSinceLastRequest);
      }

      const { fn, resolve, reject } = this.queue.shift();
      this.lastRequestTime = Date.now();

      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setRateLimit(rps) {
    this.requestsPerSecond = rps;
    this.minInterval = 1000 / rps;
  }
}