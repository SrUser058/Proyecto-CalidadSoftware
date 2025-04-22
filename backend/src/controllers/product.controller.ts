import type { Request, Response } from 'express';
import { query } from '../config/db';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { code, name, description, quantity, price } = req.body;
    console.log('Creating product:', { code, name, description, quantity, price }); // Debug log
    
    const result = await query(
      'INSERT INTO products (code, name, description, quantity, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [code, name, description, quantity, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM products', []);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price } = req.body;

    const result = await query(
      'UPDATE products SET name = $1, description = $2, quantity = $3, price = $4 WHERE id = $5 RETURNING *',
      [name, description, quantity, price, id]
    );

    if (!result.rows.length) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.json({ message: 'Producto actualizado exitosamente', product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (!result.rows.length) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};