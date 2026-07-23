import { PrismaClient } from '@prisma/client';
import fluentFfmpeg from 'fluent-ffmpeg';
import type { ISpeechProvider } from '../providers/speech/ISpeechProvider.js';
import { PiperSpeechProvider } from '../providers/speech/PiperSpeechProvider.js';
import { config } from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';

export class VideoService {
  private prisma: PrismaClient;
  private speechProvider: ISpeechProvider;

  constructor() {
    this.prisma = new PrismaClient();
    this.speechProvider = new PiperSpeechProvider();
  }

  async generateVideo(roteiroId: string) {
    const roteiro = await this.prisma.roteiro.findUnique({ where: { id: roteiroId } });
    if (!roteiro) throw new Error('Roteiro não encontrado');

    try {
      await this.prisma.roteiro.update({
        where: { id: roteiroId },
        data: { status: 'PROCESSANDO' }
      });

      // 1. Gerar narração
      const speech = await this.speechProvider.generateSpeech(roteiro.texto);

      // 2. Selecionar 30 imagens aleatórias (do Supabase Storage)
      const imagens = await this.getRandomImages(30);

      // 3. Gerar vídeo com FFmpeg
      const videoPath = await this.createVideoWithFfmpeg(speech.audioUrl, imagens, roteiro.titulo);

      // 4. Upload para Google Drive
      const driveUrl = await this.uploadToGoogleDrive(videoPath);

      // 5. Atualizar banco
      await this.prisma.roteiro.update({
        where: { id: roteiroId },
        data: {
          status: 'CONCLUIDO',
          usado: true,
          video_url: driveUrl,
          data_processamento: new Date()
        }
      });

      console.log(`✅ Vídeo gerado: ${driveUrl}`);
    } catch (error) {
      await this.prisma.roteiro.update({
        where: { id: roteiroId },
        data: { status: 'ERRO', erro: String(error) }
      });
      console.error(error);
    }
  }

  private async createVideoWithFfmpeg(audioPath: string, images: string[], title: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = `temp/video_${Date.now()}.mp4`;

      fluentFfmpeg()
        .input('concat:' + images.join('|')) // ou usar lista de imagens com duração
        .inputOptions('-framerate 1/2') // 2 segundos por imagem
        .input(audioPath)
        .videoCodec('libx264')
        .size('1080x1920')
        .fps(30)
        .outputOptions('-shortest')
        .save(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject);
    });
  }

  private async getRandomImages(count: number): Promise<string[]> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(config.supabase.url, config.supabase.key);

  const { data: files } = await supabase.storage.from('imagens').list();

  if (!files || files.length === 0) return [];

  const shuffled = files.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(f => 
    supabase.storage.from('imagens').getPublicUrl(f.name).data.publicUrl
  );
}

  private async uploadToGoogleDrive(videoPath: string): Promise<string> {
  const { google } = await import('googleapis');
  const auth = new google.auth.OAuth2(
    config.googleDrive.clientId,
    config.googleDrive.clientSecret
  );
  auth.setCredentials({ refresh_token: config.googleDrive.refreshToken });

  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: `video_${Date.now()}.mp4`,
    parents: [config.googleDrive.folderId]
  };

  const media = {
    mimeType: 'video/mp4',
    body: require('fs').createReadStream(videoPath)
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink'
  });

  return response.data.webViewLink!;
}
}