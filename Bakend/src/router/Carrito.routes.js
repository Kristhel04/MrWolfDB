import express from 'express';
import CarritoController from '../Controller/CarritoController.js';

const router = express.Router();

router.get('/carrito/:usuarioId', CarritoController.getCarrito);
router.post('/carrito', CarritoController.addToCarrito);
router.put('/carrito', CarritoController.updateCarrito);
router.delete('/carrito', CarritoController.removeFromCarrito);
router.delete('/carrito/:usuarioId', CarritoController.clearCarrito);

export default router;
