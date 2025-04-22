class DashboardManager {
    static async initialize() {
        try {
            // Verificar autenticación
            await API.checkAuth();
            
            // Cargar contenido según el rol
            const userRole = sessionStorage.getItem('userRole');
            await this.loadDashboardContent(userRole);
            
            // Configurar temporizador de inactividad
            this.setupInactivityTimer();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            window.location.href = '/login.html';
        }
    }

    static async loadDashboardContent(role) {
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');

        // Configurar menú según el rol
        sidebar.innerHTML = this.getSidebarMenu(role);

        // Cargar contenido inicial
        if (role === '1') { // SuperAdmin
            const summary = await this.getDashboardSummary();
            mainContent.innerHTML = this.renderSummary(summary);
        } else {
            const products = await ProductManager.getProducts();
            mainContent.innerHTML = ProductManager.renderProductList(products);
        }
    }

    static getSidebarMenu(role) {
        const menuItems = {
            '1': [ // SuperAdmin
                { text: 'Dashboard', action: 'loadDashboard()' },
                { text: 'Usuarios', action: 'loadUsers()' },
                { text: 'Roles', action: 'loadRoles()' },
                { text: 'Productos', action: 'loadProducts()' }
            ],
            '2': [ // Auditor
                { text: 'Usuarios', action: 'loadUsers()' },
                { text: 'Productos', action: 'loadProducts()' }
            ],
            '3': [ // Registrador
                { text: 'Productos', action: 'loadProducts()' },
                { text: 'Usuarios', action: 'loadUsers()' }
            ]
        };

        return menuItems[role].map(item => `
            <button onclick="DashboardManager.${item.action}" class="menu-item">
                ${DOMPurify.sanitize(item.text)}
            </button>
        `).join('');
    }

    static setupInactivityTimer() {
        let inactivityTimeout;

        const resetTimer = () => {
            clearTimeout(inactivityTimeout);
            inactivityTimeout = setTimeout(() => {
                // Cerrar sesión después de 1 minuto de inactividad
                alert('Su sesión ha expirado por inactividad');
                this.logout();
            }, 60000); // 1 minuto
        };

        // Eventos para resetear el temporizador
        ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        // Iniciar el temporizador
        resetTimer();
    }

    static async getDashboardSummary() {
        try {
            return await API.fetch('/dashboard/summary');
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            return null;
        }
    }

    static renderSummary(summary) {
        if (!summary) return '<p>Error cargando el resumen</p>';

        return `
            <div class="dashboard-summary">
                <div class="summary-card">
                    <h3>Usuarios</h3>
                    <p>${summary.users}</p>
                </div>
                <div class="summary-card">
                    <h3>Productos</h3>
                    <p>${summary.products}</p>
                </div>
                <div class="summary-card">
                    <h3>Roles</h3>
                    <p>${summary.roles}</p>
                </div>
            </div>
        `;
    }

    static async loadUsers() {
        const mainContent = document.getElementById('mainContent');
        try {
            const users = await UserManager.getUsers();
            mainContent.innerHTML = UserManager.renderUserList(users);
        } catch (error) {
            mainContent.innerHTML = '<p>Error cargando usuarios</p>';
        }
    }

    static async loadRoles() {
        const mainContent = document.getElementById('mainContent');
        try {
            if (!RoleManager.isSuperAdmin()) {
                mainContent.innerHTML = '<p>No tiene permisos para ver esta sección</p>';
                return;
            }

            const roles = await RoleManager.getRoles();
            if (!roles) {
                throw new Error('No se pudieron cargar los roles');
            }

            mainContent.innerHTML = RoleManager.renderRoleList(roles);
        } catch (error) {
            console.error('Error loading roles:', error);
            mainContent.innerHTML = `<p class="error-message">Error cargando roles: ${error.message}</p>`;
        }
    }

    static async loadProducts() {
        const mainContent = document.getElementById('mainContent');
        try {
            const products = await ProductManager.getProducts();
            mainContent.innerHTML = ProductManager.renderProductList(products);
        } catch (error) {
            mainContent.innerHTML = '<p>Error cargando productos</p>';
        }
    }

    static async logout() {
        try {
            await API.logout();
            sessionStorage.clear();
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    static showCrudForm(entity) {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="card">
                <h3>Administrar ${entity}</h3>
                <form id="crudForm">
                    <input type="text" name="name" placeholder="Nombre" class="form-input mb-2" required />
                    <input type="text" name="description" placeholder="Descripción" class="form-input mb-2" />
                    <button type="submit" class="bg-blue-500 text-white p-2 rounded">Guardar</button>
                </form>
                <button onclick="DashboardManager.loadDashboardContent()">Volver</button>
            </div>
        `;

        document.getElementById('crudForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            try {
                const manager = this.getManagerForEntity(entity);
                await manager.create(data);
                alert(`${entity} guardado exitosamente`);
                this.loadDashboardContent();
            } catch (error) {
                console.error(`Error al guardar ${entity}:`, error);
                alert(error.message);
            }
        });
    }

    static getManagerForEntity(entity) {
        const managers = {
            'users': UserManager,
            'roles': RoleManager,
            'products': ProductManager
        };
        return managers[entity];
    }

    static async loadDashboard() {
        try {
            const userRole = sessionStorage.getItem('userRole');
            await this.loadDashboardContent(userRole);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            window.location.href = '/login.html';
        }
    }
}

// Inicializar dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    DashboardManager.initialize();
});

// Hacer la clase disponible globalmente
window.DashboardManager = DashboardManager;