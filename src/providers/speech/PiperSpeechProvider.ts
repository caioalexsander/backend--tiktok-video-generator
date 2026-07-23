import { ISpeechProvider, SpeechOptions, SpeechResult } from './ISpeechProvider.js';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';

const execPromise = util.promisify(exec);

export class PiperSpeechProvider implements ISpeechProvider {
  private modelPath = 'models/voice.pt-BR.onnx';

  async generateSpeech(text: string, options: SpeechOptions = {}): Promise<SpeechResult> {
    const outputPath = path.join('temp', `narration_${Date.now()}.wav`);

    await fs.mkdir('temp', { recursive: true });

    const command = `./piper --model ${this.modelPath} --output_file ${outputPath}`;

    await execPromise(command, { input: text });

    return {
      audioUrl: outputPath,
      duration: 60, // calcular com ffprobe depois
      success: true
    };
  }
}