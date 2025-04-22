class RoleManager {
    static async getRoles() {
        try {
            return await API.fetch('/roles');
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    }

    static async createRole(roleData) {
        if (!this.isSuperAdmin()) {
            throw new Error('Solo el SuperAdmin puede gestionar roles');
        }

        try {
            return await API.fetch('/roles', {
                method: 'POST',
                body: JSON.stringify(this.sanitizeRoleData(roleData))
            });
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    }

    static async updateRole(id, roleData) {
        if (!this.isSuperAdmin()) {
            throw new Error('Solo el SuperAdmin puede gestionar roles');
        }

        try {
            //console.log('Sending update request:', { id, roleData }); // Debug log

            const sanitizedData = this.sanitizeRoleData(roleData);
            const response = await API.fetch(`/roles/${id}`, {
                method: 'PUT',
                body: JSON.stringify(sanitizedData)
            });

            if (!response) {
                throw new Error('No se recibió respuesta del servidor');
            }

            return response;
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }

    static async deleteRole(id) {
        if (!this.isSuperAdmin()) {
            throw new Error('Solo el SuperAdmin puede gestionar roles');
        }

        try {
            return await API.fetch(`/roles/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting role:', error);
            throw error;
        }
    }

    static isSuperAdmin() {
        return sessionStorage.getItem('userRole') === '1';
    }

    static sanitizeRoleData(data) {
        return {
            name: DOMPurify.sanitize(data.name),
            permissions: Array.isArray(data.permissions) 
                ? data.permissions.map(p => DOMPurify.sanitize(p))
                : []
        };
    }

    static renderRoleList(roles = []) {
        if (!this.isSuperAdmin()) {
            return '<p>No tiene permisos para ver esta sección</p>';
        }

        if (!Array.isArray(roles)) {
            console.error('Invalid roles data:', roles);
            return '<p>Error: formato de roles inválido</p>';
        }

        //console.log('Rendering roles:', roles); // Log para debugging

        const template = roles.map(role => {
            const permissions = Array.isArray(role.permissions) 
                ? role.permissions.join(', ') 
                : typeof role.permissions === 'string' 
                    ? role.permissions 
                    : 'Sin permisos';

            return `
                <div class="role-card" data-id="${role.id || ''}">
                    <h3>${DOMPurify.sanitize(role.name || '')}</h3>
                    <p>Permisos: ${DOMPurify.sanitize(permissions)}</p>
                    <div class="role-actions">
                        <button onclick="RoleManager.editRole(${role.id})">Editar</button>
                        <button onclick="RoleManager.deleteRole(${role.id})">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="roles-container">
                <button class="create-role-btn" onclick="RoleManager.showCreateForm()">Nuevo Rol</button>
                <div class="roles-grid">
                    ${template}
                </div>
            </div>
        `;
    }

    static showCreateForm() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <form id="createRoleForm" class="card">
                <h3>Crear Nuevo Rol</h3>
                <div class="form-group">
                    <label for="name">Nombre del Rol</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label>Permisos</label>
                    <div class="permissions-group">
                        <label>
                            <input type="checkbox" name="permissions" value="read"> Lectura
                        </label>
                        <label>
                            <input type="checkbox" name="permissions" value="write"> Escritura
                        </label>
                        <label>
                            <input type="checkbox" name="permissions" value="delete"> Eliminar
                        </label>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit">Crear Rol</button>
                    <button type="button" onclick="DashboardManager.loadRoles()">Cancelar</button>
                </div>
            </form>
        `;

        document.getElementById('createRoleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                const permissions = Array.from(
                    e.target.querySelectorAll('input[name="permissions"]:checked')
                ).map(input => input.value);
                
                await RoleManager.createRole({
                    name: formData.get('name'),
                    permissions: permissions
                });
                alert('Rol creado exitosamente');
                DashboardManager.loadRoles();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    static async editRole(id) {
        try {
            const roles = await this.getRoles();
            const role = roles.find(r => r.id === id);
            if (!role) throw new Error('Rol no encontrado');

            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = `
                <form id="editRoleForm" class="card">
                    <h3>Editar Rol</h3>
                    <div class="form-group">
                        <label for="name">Nombre del Rol</label>
                        <input type="text" id="name" name="name" value="${DOMPurify.sanitize(role.name)}" required>
                    </div>
                    <div class="form-group">
                        <label>Permisos</label>
                        <div class="permissions-group">
                            <label>
                                <input type="checkbox" name="permissions" value="read" 
                                    ${role.permissions.includes('read') ? 'checked' : ''}> Lectura
                            </label>
                            <label>
                                <input type="checkbox" name="permissions" value="write"
                                    ${role.permissions.includes('write') ? 'checked' : ''}> Escritura
                            </label>
                            <label>
                                <input type="checkbox" name="permissions" value="delete"
                                    ${role.permissions.includes('delete') ? 'checked' : ''}> Eliminar
                            </label>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Guardar Cambios</button>
                        <button type="button" onclick="DashboardManager.loadRoles()">Cancelar</button>
                    </div>
                </form>
            `;

            document.getElementById('editRoleForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(e.target);
                    const permissions = Array.from(
                        e.target.querySelectorAll('input[name="permissions"]:checked')
                    ).map(input => input.value);

                    const updateData = {
                        name: formData.get('name'),
                        permissions: permissions
                    };

                    //console.log('Submitting update:', updateData); // Debug log

                    await RoleManager.updateRole(id, updateData);
                    alert('Rol actualizado exitosamente');
                    DashboardManager.loadRoles();
                } catch (error) {
                    console.error('Error al actualizar rol:', error);
                    alert(error.message || 'Error al actualizar el rol');
                }
            });
        } catch (error) {
            console.error('Error loading role:', error);
            alert('Error al cargar el rol');
        }
    }
}

// Make RoleManager available globally
window.RoleManager = RoleManager;