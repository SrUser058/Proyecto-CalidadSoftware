import express from 'express';
import { verifyToken } from '../config/jwt';
import { checkRole } from '../middlewares/role.middleware';
import { createProduct, getProducts, updateProduct, deleteProduct } from '../controllers/product.controller';
import { query } from '../config/db';

const router = express.Router();

// Middleware para validar parámetros de búsqueda
const validateSearchParams = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { name } = req.query;
    if (name && typeof name === 'string') {
        // Check for SQL injection patterns
        const sqlInjectionPattern = /('|;|--|\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b)/gi;
        if (sqlInjectionPattern.test(name)) {
            return res.status(400).json({ error: 'Invalid search parameter' });
        }
    }
    next();
};

// Move route declarations after middleware definitions
const routes = express.Router();

// Apply validation middleware before any other middleware
routes.use(validateSearchParams);

// Then apply authentication and role checks
routes.get('/', getProducts);
routes.post('/', verifyToken, checkRole([1, 3]), createProduct);
routes.put('/:id', verifyToken, checkRole([1, 3]), updateProduct);
routes.delete('/:id', verifyToken, checkRole([1, 3]), deleteProduct);

export default routes;