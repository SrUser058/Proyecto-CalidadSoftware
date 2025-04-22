class UserManager {
    static async getUsers() {
        try {
            return await API.fetch('/users');
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    static async createUser(userData) {
        if (!this.isSuperAdmin()) {
            throw new Error('Solo el SuperAdmin puede crear usuarios');
        }

        try {
            // Add debug log to see what data we're sending
            console.log('Creating user with data:', userData);
            
            // Sanitize and format the data correctly
            const sanitizedData = {
                username: DOMPurify.sanitize(userData.username),
                password: userData.password, // Don't sanitize password
                role_id: parseInt(userData.roleId) // Changed from roleId to role_id to match backend
            };

            return await API.fetch('/users', {
                method: 'POST',
                body: JSON.stringify(sanitizedData)
            });
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async updateUser(id, userData) {
        if (!this.isSuperAdmin()) {
            throw new Error('Solo el SuperAdmin puede actualizar usuarios');
        }

        try {
            return await API.fetch(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(this.sanitizeUserData(userData))
            });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    static async deleteUser(id) {
        if (!this.isSuperAdmin()) {
            throw new Error('Solo el SuperAdmin puede eliminar usuarios');
        }

        try {
            return await API.fetch(`/users/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    static isSuperAdmin() {
        return sessionStorage.getItem('userRole') === '1';
    }

    static hasViewPermission() {
        const userRole = sessionStorage.getItem('userRole');
        return ['1', '2', '3'].includes(userRole); // Todos pueden ver usuarios
    }

    static sanitizeUserData(data) {
        return {
            username: DOMPurify.sanitize(data.username),
            roleId: parseInt(data.roleId),
            ...(data.password && { password: data.password }) // Solo incluir password si existe
        };
    }

    static renderUserList(users) {
        if (!this.hasViewPermission()) {
            return '<p>No tiene permisos para ver esta sección</p>';
        }

        const template = users.map(user => {
            const lastLogin = user.last_login 
                ? new Date(user.last_login).toLocaleString()
                : 'Nunca';

            return `
                <div class="user-card" data-id="${user.id}">
                    <h3>${DOMPurify.sanitize(user.username)}</h3>
                    <p>Rol: ${user.role_id}</p>
                    <p>Último acceso: ${lastLogin}</p>
                    ${this.isSuperAdmin() ? `
                        <button onclick="UserManager.editUser(${user.id})">Editar</button>
                        <button onclick="UserManager.deleteUser(${user.id})">Eliminar</button>
                    ` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="users-container">
                ${this.isSuperAdmin() ? `
                    <button onclick="UserManager.showCreateForm()">Nuevo Usuario</button>
                ` : ''}
                <div class="users-grid">
                    ${template}
                </div>
            </div>
        `;
    }

    static editUser(id) {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <form id="editUserForm" class="card">
                <h3>Editar Usuario</h3>
                <div class="form-group">
                    <label for="username">Nombre de Usuario</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="roleId">Rol</label>
                    <select id="roleId" name="roleId" required>
                        <option value="1">SuperAdmin</option>
                        <option value="2">Auditor</option>
                        <option value="3">Registrador</option>
                    </select>
                </div>
                <button type="submit">Guardar Cambios</button>
                <button type="button" onclick="DashboardManager.loadUsers()">Cancelar</button>
            </form>
        `;

        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                await UserManager.updateUser(id, Object.fromEntries(formData));
                alert('Usuario actualizado exitosamente');
                DashboardManager.loadUsers();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    static showCreateForm() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <form id="createUserForm" class="card">
                <h3>Crear Nuevo Usuario</h3>
                <div class="form-group">
                    <label for="username">Nombre de Usuario</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="roleId">Rol</label>
                    <select id="roleId" name="roleId" required>
                        <option value="1">SuperAdmin</option>
                        <option value="2">Auditor</option>
                        <option value="3">Registrador</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit">Crear Usuario</button>
                    <button type="button" onclick="DashboardManager.loadUsers()">Cancelar</button>
                </div>
            </form>
        `;

        document.getElementById('createUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                const userData = {
                    username: formData.get('username'),
                    password: formData.get('password'),
                    roleId: formData.get('roleId')
                };

                console.log('Form data:', userData); // Debug log
                
                await UserManager.createUser(userData);
                alert('Usuario creado exitosamente');
                DashboardManager.loadUsers();
            } catch (error) {
                console.error('Error creating user:', error);
                alert(error.message || 'Error al crear el usuario');
            }
        });
    }
}

// Make UserManager available globally
window.UserManager = UserManager;