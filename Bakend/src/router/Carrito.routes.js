import express from 'express';
import CarritoController from '../Controller/CarritoController.js';

const router = express.Router();

router.get('/:usuarioId', CarritoController.getCarrito);
router.post('/', CarritoController.addToCarrito);
router.delete('/:id', CarritoController.removeFromCarrito);
router.delete('/vaciar/:usuarioId', CarritoController.clearCarrito);

export default router;
