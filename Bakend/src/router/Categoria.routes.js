import { Router } from 'express';
import CategoriaController from '../Controller/CategoriaController.js';

const router = Router();

// Definir rutas y asociarlas a los métodos del controlador
router.get('/categorias', CategoriaController.getAll);
router.get('/categorias/:id', CategoriaController.getById);
router.post('/categorias', CategoriaController.create);
router.put('/categorias/:id', CategoriaController.update);
router.delete('/categorias/:id', CategoriaController.delete); 

export default router;