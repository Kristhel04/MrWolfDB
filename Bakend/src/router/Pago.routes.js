import { Router } from 'express';
import PagoController from '../Controller/PagoController';

const router = Router();

router.post('/pagos', PagoController.crearPago);
router.post('/pago/webhook', PagoController.webhookTilopay);

export default router;
