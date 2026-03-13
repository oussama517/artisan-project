/**
 * Simple in-process job queue for background tasks.
 * For production with multiple instances, swap to BullMQ with Redis.
 */

type JobHandler = (data: any) => Promise<void>;

interface Job {
  id: string;
  type: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

class SimpleQueue {
  private handlers = new Map<string, JobHandler>();
  private processing = false;
  private queue: Job[] = [];

  /**
   * Register a handler for a job type
   */
  register(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Add a job to the queue
   */
  async add(type: string, data: any, maxAttempts = 3): Promise<string> {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.queue.push({
      id,
      type,
      data,
      attempts: 0,
      maxAttempts,
      createdAt: new Date(),
    });

    // Process in the background
    if (!this.processing) {
      this.processNext();
    }

    return id;
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const job = this.queue.shift()!;
    const handler = this.handlers.get(job.type);

    if (!handler) {
      console.error(`No handler registered for job type: ${job.type}`);
      this.processNext();
      return;
    }

    try {
      job.attempts++;
      await handler(job.data);
    } catch (error) {
      console.error(`Job ${job.id} failed (attempt ${job.attempts}/${job.maxAttempts}):`, error);

      if (job.attempts < job.maxAttempts) {
        // Re-queue with exponential backoff
        setTimeout(() => {
          this.queue.push(job);
          if (!this.processing) this.processNext();
        }, Math.pow(2, job.attempts) * 1000);
      }
    }

    // Process next job
    setTimeout(() => this.processNext(), 100);
  }
}

// Singleton queue instance
export const jobQueue = new SimpleQueue();

// ─── Register default handlers ────────────────────────────

import { sendEmail } from './email';

jobQueue.register('send-email', async (data: { to: string; subject: string; html: string }) => {
  await sendEmail(data);
});
