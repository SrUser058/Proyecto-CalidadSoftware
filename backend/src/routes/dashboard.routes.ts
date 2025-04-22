import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Solo el rol 1 (SuperAdmin) puede acceder a este endpoint
router.get('/summary', authenticate, checkRole([1]), getDashboardSummary);

export default router;