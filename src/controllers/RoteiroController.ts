import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { videoQueue } from '../queue/index.js';

const prisma = new PrismaClient();

export class RoteiroController {
  async create(req: Request, res: Response) {
    const { titulo, texto } = req.body;
    const roteiro = await prisma.roteiro.create({
      data: { titulo, texto, status: 'PENDENTE' }
    });
    res.json(roteiro);
  }

  async generateAll(req: Request, res: Response) {
    const pendentes = await prisma.roteiro.findMany({
      where: { status: 'PENDENTE' }
    });

    for (const r of pendentes) {
      await videoQueue.add('generate-video', { roteiroId: r.id });
    }

    res.json({ message: `${pendentes.length} roteiros enviados para fila` });
  }

  async stats(req: Request, res: Response) {
    const stats = await prisma.roteiro.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    res.json(stats);
  }
}