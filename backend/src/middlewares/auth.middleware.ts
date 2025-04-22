import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    
    // Verificar si el usuario existe en la base de datos
    const { rows } = await query('SELECT id FROM users WHERE id = $1', [decoded.userId]);
    
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Asignar el userId al request
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};