import express from 'express';
import ResenaController from '../Controller/ResenaController.js';
import { authenticateToken } from '../Middleware/JwtAuth.js';
const router = express.Router();

router.get('/resenas', ResenaController.getAll);
router.get('/resenas/producto/:id', ResenaController.getResenasByProducto);
router.delete('/resenas/:id', ResenaController.delete);
router.post("/resenas", authenticateToken, ResenaController.create);

export default router;
