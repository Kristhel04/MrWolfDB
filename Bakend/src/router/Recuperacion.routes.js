import express from 'express';
import RecuperacionController from '../Controller/RecuperacionController.js';

const router = express.Router();

router.post('/recuperar/solicitarCodigo', RecuperacionController.solicitarCodigo);
router.post('/recuperar/verificarCodigo', RecuperacionController.verificarCodigo);
router.post('/recuperar/restablecerContrasena', RecuperacionController.restablecerContrasena);

export default router;
