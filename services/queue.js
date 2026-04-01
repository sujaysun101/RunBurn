class InMemoryQueue {
  constructor({ intervalMs = 1500 } = {}) {
    this.intervalMs = intervalMs;
    this.pending = [];
    this.processing = false;
    this.timer = null;
  }

  start() {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(async () => {
      if (this.processing || this.pending.length === 0) {
        return;
      }

      const task = this.pending.shift();
      this.processing = true;

      try {
        await task();
      } catch (error) {
        console.error("[queue] task failed", {
          message: error.message
        });
      } finally {
        this.processing = false;
      }
    }, this.intervalMs);
  }

  enqueue(task) {
    this.pending.push(task);
    this.start();
  }
}

const queue = new InMemoryQueue();

module.exports = {
  queue,
  InMemoryQueue
};
