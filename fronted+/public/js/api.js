const API_BASE_URL = 'http://localhost:3030/api';

// Función para sanitizar datos para prevenir XSS
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Clase para manejar las llamadas a la API
class API {
    static async fetch(endpoint, options = {}) {
        const token = sessionStorage.getItem('token');
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error en la petición');
            }

            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async login(username, password) {
        try {
            const response = await this.fetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ 
                    username: sanitizeInput(username), 
                    password 
                })
            });

            if (response.token) {
                sessionStorage.setItem('token', response.token);
                sessionStorage.setItem('userRole', response.role);
            }
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async logout() {
        try {
            await this.fetch('/auth/logout', { method: 'POST' });
            sessionStorage.removeItem('token');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    static async checkAuth() {
        try {
            return await this.fetch('/auth/check');
        } catch (error) {
            console.error('Auth check error:', error);
            throw error;
        }
    }
}