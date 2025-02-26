import {Router} from 'express';
import ProductoController from '../Controller/ProductoController.js';
import upload from "../Middleware/uploadMiddleware.js";

const router = Router();

router.get('/productos', ProductoController.getAll);
router.post('/productos/buscar', ProductoController.busqueda);
router.post("/productos", upload.array("imagenes", 5), ProductoController.create);
router.put("/productos/:id", upload.array("imagenes", 5), ProductoController.update);
router.delete('/productos', ProductoController.delete);

export default router;