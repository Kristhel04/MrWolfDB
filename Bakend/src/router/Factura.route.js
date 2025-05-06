import express from 'express';
import FacturaController from '../Controller/FacturaController.js';
import { authenticateToken, authorizeRole } from '../Middleware/JwtAuth.js';

const router = express.Router();
router.get('/factura/:id', authenticateToken, FacturaController.verFacturaPorId);
// Crear una nueva factura (usuario autenticado)
router.post('/crear/Factura', authenticateToken, FacturaController.create);


// Obtener facturas del usuario autenticado
router.get('/usuario', authenticateToken, FacturaController.getFacturasUsuario);

// Obtener todas las facturas (solo para admin)
router.get('/admin', authenticateToken, authorizeRole(['admin']), FacturaController.getAll);

// Descargar factura en PDF
router.get('/pdf/:id',FacturaController.generarFacturaPDF);

export default router;
