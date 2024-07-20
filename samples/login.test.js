// File: login.test.js
(async () => {
    const { expect } = await import('chai');
    const login = require('./login');

    describe('Login Function', () => {
        it('should login successfully with correct username and password', () => {
            const result = login('user', 'password');
            expect(result.status).to.equal('success');
            expect(result.message).to.equal('Login successful');
        });

        it('should fail login with incorrect username', () => {
            const result = login('wrongUser', 'password');
            expect(result.status).to.equal('error');
            expect(result.message).to.equal('Invalid username or password');
        });

        it('should fail login with incorrect password', () => {
            const result = login('user', 'wrongPassword');
            expect(result.status).to.equal('error');
            expect(result.message).to.equal('Invalid username or password');
        });
    });
})();
