import express from 'express';
import { createRole, getRoles, updateRole, deleteRole } from '../controllers/role.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = express.Router();

router.post('/', authenticate, checkRole([1]), createRole);
router.get('/', authenticate, checkRole([1]), getRoles);
router.put('/:id', authenticate, checkRole([1]), updateRole); // Nueva ruta para actualizar roles
router.delete('/:id', authenticate, checkRole([1]), deleteRole); // Nueva ruta para eliminar roles

export default router;