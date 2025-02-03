import {Router} from 'express';
import ProductoController from '../Controller/ProductoController.js';

const router = Router();

router.get('/productos', ProductoController.getAll);
router.get('/productos/:id', ProductoController.getById);
router.post('/productos', ProductoController.create);
router.put('/productos/:id', ProductoController.update);
router.delete('/productos/:id', ProductoController.delete);

export default router;