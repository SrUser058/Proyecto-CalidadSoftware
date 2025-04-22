import { Request, Response } from 'express';
import { query } from '../config/db';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT id, username, role_id, 
             to_char(last_login, 'YYYY-MM-DD HH24:MI:SS') as last_login 
      FROM users
      ORDER BY last_login DESC NULLS LAST
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role_id } = req.body;
    
    console.log('Received data:', { username, password: '***', role_id }); // Debug log

    // Validar que los campos requeridos estén presentes
    if (!username || !password || !role_id) {
      console.log('Missing fields:', { 
        username: !username, 
        password: !password, 
        role_id: !role_id 
      });
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el usuario en la base de datos
    const result = await query(
      'INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING id, username, role_id',
      [username, hashedPassword, role_id]
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, role_id } = req.body;

    const result = await query(
      'UPDATE users SET username = $1, role_id = $2 WHERE id = $3 RETURNING *',
      [username, role_id, id]
    );

    if (!result.rows.length) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ message: 'Usuario actualizado exitosamente', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (!result.rows.length) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};