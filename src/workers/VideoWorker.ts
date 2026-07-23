import { Worker } from 'bullmq';
import { VideoService } from '../services/VideoService.js';
import { config } from '../config/index.js';

const videoService = new VideoService();

export const startWorker = () => {
  const worker = new Worker('video-generation', async (job) => {
    const { roteiroId } = job.data;
    await videoService.generateVideo(roteiroId);
  }, {
    connection: { url: config.redis },
    concurrency: 2
  });

  console.log('👷 Video Worker iniciado');
  return worker;
};