class ProductManager {
    static async getProducts() {
        try {
            return await API.fetch('/products');
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    static async createProduct(productData) {
        if (!this.hasPermission('create')) {
            throw new Error('No tiene permisos para crear productos');
        }

        try {
            return await API.fetch('/products', {
                method: 'POST',
                body: JSON.stringify(this.sanitizeProductData(productData))
            });
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    static async updateProduct(id, productData) {
        if (!this.hasPermission('update')) {
            throw new Error('No tiene permisos para actualizar productos');
        }

        try {
            return await API.fetch(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(this.sanitizeProductData(productData))
            });
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    static async deleteProduct(id) {
        if (!this.hasPermission('delete')) {
            throw new Error('No tiene permisos para eliminar productos');
        }

        try {
            return await API.fetch(`/products/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    static hasPermission(action) {
        const userRole = sessionStorage.getItem('userRole');
        const permissionMap = {
            'create': ['1', '3'],  // SuperAdmin y Registrador
            'update': ['1', '3'],
            'delete': ['1', '3'],
            'view': ['1', '2', '3'] // Todos pueden ver
        };

        return permissionMap[action]?.includes(userRole) || false;
    }

    static sanitizeProductData(data) {
        return {
            name: DOMPurify.sanitize(data.name),
            description: DOMPurify.sanitize(data.description),
            price: parseFloat(data.price) || 0,
            quantity: parseInt(data.quantity) || 0, 
            code: DOMPurify.sanitize(data.code)
        };
    }

    static renderProductList(products) {
        const template = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <h3>${DOMPurify.sanitize(product.name)}</h3>
                <p>${DOMPurify.sanitize(product.description)}</p>
                <p>Precio: $${product.price}</p>
                <p>Stock: ${product.quantity}</p> 
                ${this.hasPermission('update') ? `
                    <button onclick="ProductManager.editProduct(${product.id})">Editar</button>
                ` : ''}
                ${this.hasPermission('delete') ? `
                    <button onclick="ProductManager.deleteProduct(${product.id})">Eliminar</button>
                ` : ''}
            </div>
        `).join('');

        return `
            <div class="products-container">
                ${this.hasPermission('create') ? `
                    <button onclick="ProductManager.showCreateForm()">Nuevo Producto</button>
                ` : ''}
                <div class="products-grid">
                    ${template}
                </div>
            </div>
        `;
    }

    static renderProductForm() {
        return `
            <form id="productForm" class="card">
                <h3>Gestionar Producto</h3>
                <div class="form-group">
                    <label for="productName">Nombre</label>
                    <input type="text" id="productName" required>
                </div>
                <div class="form-group">
                    <label for="productDescription">Descripción</label>
                    <textarea id="productDescription" required></textarea>
                </div>
                <div class="form-group">
                    <label for="productPrice">Precio</label>
                    <input type="number" id="productPrice" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="productStock">Stock</label>
                    <input type="number" id="productStock" required>
                </div>
                <button type="submit">Guardar Producto</button>
            </form>
        `;
    }

    static showCreateForm() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <form id="createProductForm" class="card">
                <h3>Crear Nuevo Producto</h3>
                <div class="form-group">
                    <label for="name">Nombre del Producto</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="price">Precio</label>
                    <input type="number" 
                        id="price" 
                        name="price" 
                        step="0.01" 
                        min="0"
                        inputmode="decimal"
                        required>
                </div>
                <div class="form-group">
                    <label for="quantity">Cantidad</label>
                    <input type="number" 
                        id="quantity" 
                        name="quantity"
                        min="0"
                        inputmode="numeric"
                        required>
                </div>
                <div class="form-group">
                    <label for="code">Código</label>
                    <input type="text" id="code" name="code" required>
                </div>
                <div class="form-actions">
                    <button type="submit">Crear Producto</button>
                    <button type="button" onclick="DashboardManager.loadProducts()">Cancelar</button>
                </div>
            </form>
        `;

        document.getElementById('createProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                const productData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    price: parseFloat(formData.get('price')),
                    quantity: parseInt(formData.get('quantity')), 
                    code: formData.get('code')
                };

                await ProductManager.createProduct(productData);
                alert('Producto creado exitosamente');
                DashboardManager.loadProducts();
            } catch (error) {
                console.error('Error creating product:', error);
                alert(error.message || 'Error al crear el producto');
            }
        });
    }

    static editProduct(id) {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <form id="editProductForm" class="card">
                <h3>Editar Producto</h3>
                <div class="form-group">
                    <label for="name">Nombre del Producto</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="price">Precio</label>
                    <input type="number" 
                        id="price" 
                        name="price" 
                        step="0.01"
                        min="0"
                        inputmode="decimal" 
                        required>
                </div>
                <div class="form-group">
                    <label for="quantity">Cantidad</label>
                    <input type="number" 
                        id="quantity" 
                        name="quantity"
                        min="0"
                        inputmode="numeric" 
                        required>
                </div>
                <div class="form-actions">
                    <button type="submit">Guardar Cambios</button>
                    <button type="button" onclick="DashboardManager.loadProducts()">Cancelar</button>
                </div>
            </form>
        `;

        // Cargar datos del producto existente
        (async () => {
            try {
                const products = await ProductManager.getProducts();
                const product = products.find(p => p.id === id);
                if (!product) throw new Error('Producto no encontrado');

                document.getElementById('name').value = product.name;
                document.getElementById('description').value = product.description;
                document.getElementById('price').value = product.price;
                document.getElementById('quantity').value = product.quantity; // Cambiado de stock a quantity
            } catch (error) {
                console.error('Error loading product:', error);
                alert('Error al cargar el producto');
                DashboardManager.loadProducts();
            }
        })();

        document.getElementById('editProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                const productData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    price: parseFloat(formData.get('price')),
                    quantity: parseInt(formData.get('quantity')) // Cambiado de stock a quantity
                };

                await ProductManager.updateProduct(id, productData);
                alert('Producto actualizado exitosamente');
                DashboardManager.loadProducts();
            } catch (error) {
                console.error('Error updating product:', error);
                alert(error.message || 'Error al actualizar el producto');
            }
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                await ProductManager.createProduct(Object.fromEntries(formData));
                alert('Producto creado exitosamente');
                window.location.reload();
            } catch (error) {
                alert(error.message);
            }
        });
    }
});

// Make ProductManager available globally
window.ProductManager = ProductManager;