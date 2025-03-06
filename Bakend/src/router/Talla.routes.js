import {Router} from 'express';
import TallaController from '../Controller/TallaController.js';

const router = Router();

router.get('/tallas', TallaController.getAllTallas);

export default router;
