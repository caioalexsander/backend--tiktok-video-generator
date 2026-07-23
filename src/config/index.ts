import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  supabase: {
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_KEY!,
  },
  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN!,
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  },
  redis: process.env.REDIS_URL!,
  speechProvider: process.env.SPEECH_PROVIDER || 'clipchamp',
  ffmpegPath: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
  logLevel: process.env.LOG_LEVEL || 'info',
};