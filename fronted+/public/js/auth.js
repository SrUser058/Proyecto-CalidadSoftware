// Tiempo de inactividad en milisegundos (1 minuto)
const INACTIVITY_TIMEOUT = 60000;
let inactivityTimer;

// Función para reiniciar el temporizador de inactividad
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logout, INACTIVITY_TIMEOUT);
}

// Función para manejar el inicio de sesión

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await API.login(username, password);
        if (response && response.token) {
            sessionStorage.setItem('token', response.token);
            sessionStorage.setItem('userRole', response.role);
            window.location.href = '/index.html';
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Error al iniciar sesión');
    }
}

async function logout() {
    try {
        await API.logout();
        sessionStorage.clear();
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Redireccionar aunque falle el logout
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
}

// Evento para el formulario de login
document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

// Eventos para detectar actividad del usuario
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Iniciar el temporizador cuando se carga la página
resetInactivityTimer();