import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { checkRole } from '@/middlewares/role.middleware';

const router = Router();

router.get('/', authenticate, getUsers);
router.post('/', authenticate, checkRole([1]), createUser);
router.put('/:id', authenticate, checkRole([1]), updateUser); // Nueva ruta para actualizar usuarios
router.delete('/:id', authenticate, checkRole([1]), deleteUser); // Nueva ruta para eliminar usuarios

export default router;