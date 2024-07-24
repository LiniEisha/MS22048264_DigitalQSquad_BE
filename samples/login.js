// File: login.js
function login(username, password) {
    // Simulate login logic
    if (username === 'user' && password === 'password') {
        return { status: 'success', message: 'Login successful' };
    } else {
        return { status: 'error', message: 'Invalid username or password' };
    }
}

export { login };
