import express from 'express';
import FacturaController from '../Controller/FacturaController.js';
import { authenticateToken, authorizeRole } from '../Middleware/JwtAuth.js';

const router = express.Router();
router.get('/factura/:id', authenticateToken, FacturaController.verFacturaPorId);
router.post('/crear/Factura', authenticateToken, FacturaController.create);
router.get('/facturas', authenticateToken, FacturaController.getFacturasUsuario);
router.get('/admin', authenticateToken, authorizeRole(['Administrador']), FacturaController.getAll);
router.delete('/delete/factura',authenticateToken, authorizeRole(['Administrador']),FacturaController.eliminarFactura)
// Descargar factura en PDF
router.get('/pdf/:id',FacturaController.generarFacturaPDF);


export default router;
