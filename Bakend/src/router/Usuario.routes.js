import { Router } from 'express';
import UsuarioController from '../Controller/UsuarioController.js'; // Importa el controlador
import { authenticateToken, authorizeRole } from '../Middleware/JwtAuth.js';

const router = Router();

// Definir rutas y asociarlas a los métodos del controlador
router.get('/usuarios', authenticateToken, authorizeRole(['Administrador']), UsuarioController.getAllUsers);
router.post('/usuarios', UsuarioController.createUser);
router.get('/usuarios/:id', authenticateToken, authorizeRole(['Administrador']), UsuarioController.getUserById);
router.put('/usuarios/:id', UsuarioController.updateUser);
router.delete('/usuarios/:id', authenticateToken, authorizeRole(['Administrador']), UsuarioController.deleteUser);
router.post('/login', UsuarioController.login);


export default router;
