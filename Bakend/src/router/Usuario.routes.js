import { Router } from 'express';
import UsuarioController from '../Controller/UsuarioController.js'; // Importa el controlador
import { authenticateToken, authorizeRole } from '../Middleware/JwtAuth.js';

const router = Router();

// Definir rutas y asociarlas a los métodos del controlador
//router.get('/usuarios', authenticateToken, authorizeRole(['Administrador']), UsuarioController.getAllUsers);
router.get('/usuarios',UsuarioController.getAllUsers);
router.post('/usuarios', UsuarioController.createUser);
router.get('/usuarios/:cedula', authenticateToken, authorizeRole(['Administrador']), UsuarioController.getUserById);
router.put('/usuarios/:cedula', UsuarioController.updateUser);
//router.delete('/usuarios/:cedula', authenticateToken, authorizeRole(['Administrador']), UsuarioController.deleteUser);
router.delete('/usuarios/:cedula', UsuarioController.deleteUser);
router.post('/login', UsuarioController.login);
router.post('/logout', UsuarioController.logout);
router.post('/refresh-token', UsuarioController.refreshToken);
router.get("/perfil", authenticateToken, UsuarioController.getProfile);


export default router;
