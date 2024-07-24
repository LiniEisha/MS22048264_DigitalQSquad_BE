// File: loginAutomation.test.js
import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('Login Automation Tests', function() {
    this.timeout(10000); // Increase timeout to 10 seconds

    it('should login successfully via the web interface', async function() {
        const browser = await puppeteer.launch({ headless: false }); // Set headless: true for headless mode
        const page = await browser.newPage();

        // URL for the login page
        const url = 'http://localhost:3000'; // Change this to your application's URL

        // Go to the login page and wait for it to load
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Type the username and password
        await page.type('input[name="username"]', 'user');
        await page.type('input[name="password"]', 'password');

        // Click the login button
        await page.click('button[type="submit"]');

        // Wait for the login to complete
        await page.waitForSelector('.login-success-message', { timeout: 5000 });

        // Check if the login was successful
        const successMessage = await page.$eval('.login-success-message', el => el.textContent);
        expect(successMessage).to.include('Login successful');

        // Close the browser
        await browser.close();
    });
});
