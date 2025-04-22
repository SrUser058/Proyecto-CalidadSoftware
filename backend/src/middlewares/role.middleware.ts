import type { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';

export const checkRole = (requiredRoles: number[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { rows } = await query('SELECT role_id FROM users WHERE id = $1', [req.userId]);
    if (!rows.length || !requiredRoles.includes(rows[0].role_id)) {
      return res.status(403).json({ error: 'Acceso prohibido' });
    }
    next();
  };
};