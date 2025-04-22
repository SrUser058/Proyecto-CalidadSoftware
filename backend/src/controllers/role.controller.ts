import { Request, Response } from 'express';
import { query } from '../config/db';

export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, permissions } = req.body;

    // Validar campos requeridos
    if (!name || !permissions) {
      res.status(400).json({ error: 'Nombre y permisos son requeridos' });
      return;
    }

    const result = await query(
      'INSERT INTO roles (name, permissions) VALUES ($1, $2) RETURNING *',
      [name, permissions]
    );

    res.status(201).json({
      message: 'Rol creado exitosamente',
      role: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el rol' });
  }
};

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM roles ORDER BY id ASC');
    
    // Transformar los permisos a array si vienen como string
    const roles = result.rows.map(role => ({
      id: role.id,
      name: role.name,
      permissions: typeof role.permissions === 'string' 
        ? role.permissions.split(',')
        : Array.isArray(role.permissions)
          ? role.permissions
          : []
    }));
    
    //console.log('Roles fetched:', roles); // Log para debugging
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Error al obtener los roles' });
  }
};

export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    //console.log('Updating role:', { id, name, permissions }); // Debug log

    // Validate input
    if (!name || !permissions) {
      res.status(400).json({ error: 'Nombre y permisos son requeridos' });
      return;
    }

    // Ensure permissions is an array
    const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];

    const result = await query(
      'UPDATE roles SET name = $1, permissions = $2 WHERE id = $3 RETURNING *',
      [name, permissionsArray, id]
    );

    if (!result.rows.length) {
      res.status(404).json({ error: 'Rol no encontrado' });
      return;
    }

    res.json({
      message: 'Rol actualizado exitosamente',
      role: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Error al actualizar el rol' });
  }
};

export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);

    if (!result.rows.length) {
      res.status(404).json({ error: 'Rol no encontrado' });
      return;
    }

    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el rol' });
  }
};