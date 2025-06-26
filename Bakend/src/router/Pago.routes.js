import { Router } from 'express';
import PagoController from '../Controller/PagoController.js';

const router = Router();

router.post('/pago', PagoController.crearPago);
router.post('/webhook', PagoController.webhookTilopay);

export default router;
