import {Router} from 'express';
import ProductoController from '../Controller/ProductoController.js';
import upload from "../Middleware/uploadMiddleware.js";

const router = Router();

router.get('/productos', ProductoController.getAll);
router.post('/productos/buscar', ProductoController.busqueda);
// Usar .array("imagen") si el frontend envía los archivos bajo el nombre "imagen"
router.post("/productos", upload.array("imagen", 5), ProductoController.create);
// Usar .array("imagen") si el frontend envía los archivos bajo el nombre "imagen"
router.put("/productos/:id", upload.array("imagen", 5), ProductoController.update);
router.delete('/productos/:id', ProductoController.delete);
router.get('/productos/M',ProductoController.ProductosMasculinos);
router.get('/productos/F',ProductoController.ProductosFemeninos);
router.get('/productos/Aleatorios',ProductoController.producAleatorios);

export default router;