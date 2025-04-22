import { query } from '../config/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '../config/jwt';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const { rows } = await query('SELECT * FROM users WHERE username = $1', [username]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    // Actualizar last_login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const token = generateToken(user.id);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1 hora
    });

    res.json({ 
      message: 'Login exitoso', 
      role: user.role_id,
      token,
      lastLogin: user.last_login // Incluir la última fecha de login en la respuesta
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logout exitoso' });
};

export const checkAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

    console.log('Token received:', token); // Debug log

    if (!token) {
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    
    // Get user data
    const { rows } = await query(
      'SELECT id, username, role_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!rows.length) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const user = rows[0];
    res.json({
      id: user.id,
      username: user.username,
      role: user.role_id
    });
  } catch (error) {
    console.error('Error in checkAuth:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};