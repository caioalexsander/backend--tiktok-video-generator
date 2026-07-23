import { Queue } from 'bullmq';
import { config } from '../config/index.js';

export const videoQueue = new Queue('video-generation', {
  connection: { 
    url: config.redis 
  },
});