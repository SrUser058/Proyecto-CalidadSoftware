import { Request, Response } from 'express';
import { query } from '../config/db';

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const usersCount = await query('SELECT COUNT(*) AS count FROM users');
    const productsCount = await query('SELECT COUNT(*) AS count FROM products');
    const rolesCount = await query('SELECT COUNT(*) AS count FROM roles');

    res.json({
      users: usersCount.rows[0].count,
      products: productsCount.rows[0].count,
      roles: rolesCount.rows[0].count,
    });
  } catch (error) {
    console.error('Error obteniendo resumen del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
};