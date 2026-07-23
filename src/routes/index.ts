import express from 'express';
import { RoteiroController } from '../controllers/RoteiroController.js';

const router = express.Router();
const controller = new RoteiroController();

router.post('/roteiros', controller.create);
router.post('/generate', controller.generateAll);
router.get('/stats', controller.stats);

export default router;