import { Router } from 'express';
import { login, logout, checkAuth } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login); 
router.post('/logout', logout); 
router.get('/check', checkAuth); // Nueva ruta para verificar autenticación

export default router;