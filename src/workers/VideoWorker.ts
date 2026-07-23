import { Worker, Job } from 'bullmq';
import { VideoService } from '../services/VideoService.js';
import { videoQueue } from '../queue/index.js';

const videoService = new VideoService();

export const videoWorker = new Worker('video-generation', async (job: Job) => {
  const { roteiroId } = job.data;
  console.log(`🔄 Processando job ${job.id} para roteiro ${roteiroId}`);

  await videoService.generateVideo(roteiroId);
}, {
  connection: { url: process.env.REDIS_URL! },
  concurrency: 3 // máximo simultâneo
});

videoWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} concluído`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} falhou:`, err);
});