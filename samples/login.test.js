// File: login.test.js
const login = require('./login');

test('successful login', () => {
    const result = login('user', 'password');
    expect(result.status).toBe('success');
    expect(result.message).toBe('Login successful');
});

test('failed login with incorrect username', () => {
    const result = login('wrongUser', 'password');
    expect(result.status).toBe('error');
    expect(result.message).toBe('Invalid username or password');
});

test('failed login with incorrect password', () => {
    const result = login('user', 'wrongPassword');
    expect(result.status).toBe('error');
    expect(result.message).toBe('Invalid username or password');
});
