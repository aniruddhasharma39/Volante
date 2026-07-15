import * as cron from 'node-cron';
import { ScheduledJob } from '../models/ScheduledJob';
import { ExecutionEngine } from '../../execution-engine/services/executionEngine';

export class SchedulerService {
  private static tasks = new Map<string, cron.ScheduledTask>();

  static async init() {
    console.log('Initializing Scheduler Engine...');
    const jobs = await ScheduledJob.find({ status: 'Active' });
    jobs.forEach(job => this.scheduleJob(job));
  }

  static scheduleJob(job: any) {
    if (this.tasks.has(job.id)) {
      this.tasks.get(job.id)?.stop();
    }

    const task = cron.schedule(job.cronExpression, async () => {
      console.log(`[Scheduler] Executing Job: ${job.jobName}`);
      try {
        const result = await ExecutionEngine.executeReport(job.reportId);
        console.log(`[Scheduler] Job ${job.jobName} completed. Exporting as ${job.exportFormat} and emailing to ${job.recipients.join(', ')}`);
        
        job.lastRun = new Date();
        await job.save();
      } catch (error) {
        console.error(`[Scheduler] Job ${job.jobName} failed:`, error);
      }
    });

    this.tasks.set(job.id, task);
  }

  static async createJob(data: any, userId: string) {
    const job = new ScheduledJob({ ...data, createdBy: userId });
    await job.save();
    if (job.status === 'Active') {
      this.scheduleJob(job);
    }
    return job;
  }

  static async getAllJobs() {
    return await ScheduledJob.find().populate('reportId', 'reportName');
  }

  static async toggleJob(jobId: string) {
    const job = await ScheduledJob.findById(jobId);
    if (!job) throw new Error('Job not found');

    job.status = job.status === 'Active' ? 'Paused' : 'Active';
    await job.save();

    if (job.status === 'Active') {
      this.scheduleJob(job);
    } else {
      this.tasks.get(job.id)?.stop();
      this.tasks.delete(job.id);
    }

    return job;
  }
}
