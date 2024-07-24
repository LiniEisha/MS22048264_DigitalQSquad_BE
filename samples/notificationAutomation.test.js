// File: notificationAutomation.test.js
import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('Notification System Automation Tests', function() {
    this.timeout(10000); // Increase timeout to 10 seconds

    it('should send a notification', async function() {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // URL for the notification system application
        const url = 'http://localhost:3000/notificationSystem';

        // Go to the notification system page and wait for it to load
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Ensure the type input exists before typing into it
        const typeSelector = 'input[name="type"]';
        await page.waitForSelector(typeSelector, { timeout: 5000 });

        // Example interaction with the page to send a notification
        await page.type(typeSelector, 'email');
        await page.type('input[name="recipient"]', 'user@example.com');
        await page.type('input[name="message"]', 'Hello, Email!');
        await page.click('button#sendNotification');

        // Wait for the result and verify it
        await page.waitForSelector('#notificationStatus', { timeout: 5000 });
        const notificationStatus = await page.$eval('#notificationStatus', el => el.textContent);
        console.log(`Notification Status: ${notificationStatus}`);
        expect(notificationStatus).to.include('Notification sent');

        await browser.close();
    });
});
