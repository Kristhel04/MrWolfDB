import express from 'express';
import ResenaController from '../Controller/ResenaController.js';
import { authenticateToken } from '../Middleware/JwtAuth.js';
const router = express.Router();

router.get('/resenas', ResenaController.getAll);
router.get('/resenas/producto/:id', ResenaController.getResenasByProducto);
router.post("/resenas", authenticateToken, ResenaController.create);
router.patch('/resenas/:id/ocultar', authenticateToken, ResenaController.ocultar);
router.patch('/resenas/:id/visibilidad', authenticateToken, ResenaController.toggleVisible);
router.get('/promedio/:id', ResenaController.getPuntuacionPromedio);
router.put('/resenas/:id', authenticateToken, ResenaController.update);
router.delete('/resenas/:id', authenticateToken, ResenaController.delete);
export default router;
