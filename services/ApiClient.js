const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default class ApiClient {
  constructor({ maxConcurrency, minIntervalMs, timeoutMs } = {}) {
    this.maxConcurrency = maxConcurrency ?? 4;
    this.minIntervalMs = minIntervalMs ?? 120;
    this.timeoutMs = timeoutMs ?? 12000;
    this.active = 0;
    this.queue = [];
    this.lastStart = 0;
  }

  async fetch(input, init = {}) {
    return this._schedule(() => this._fetchWithTimeout(input, init));
  }

  async _schedule(task) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        try {
          const now = Date.now();
          const delta = now - this.lastStart;
          if (delta < this.minIntervalMs) {
            await sleep(this.minIntervalMs - delta);
          }
          this.lastStart = Date.now();
          this.active++;
          const result = await task();
          resolve(result);
        } catch (e) {
          reject(e);
        } finally {
          this.active--;
          const next = this.queue.shift();
          if (next) next();
        }
      };
      if (this.active < this.maxConcurrency) run();
      else this.queue.push(run);
    });
  }

  async _fetchWithTimeout(input, init) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const resp = await fetch(input, { ...init, signal: controller.signal });
      return resp;
    } finally {
      clearTimeout(id);
    }
  }
}
