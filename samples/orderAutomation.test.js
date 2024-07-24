// File: orderAutomation.test.js
import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('Order Management System Automation Tests', function() {
    it('should add an item to the order', async function() {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // URL for the order management system application
        const url = 'http://localhost:3000/orderManagementSystem';

        // Go to the order management system page
        await page.goto(url);

        // Example interaction with the page to add an item to the order
        await page.type('input[name="orderId"]', 'ORD123');
        await page.type('input[name="itemName"]', 'Item 1');
        await page.type('input[name="itemPrice"]', '10');
        await page.type('input[name="itemQuantity"]', '2');
        await page.click('button#addItem');

        // Wait for the result and verify it
        await page.waitForSelector('#orderTotal', { timeout: 5000 });
        const orderTotal = await page.$eval('#orderTotal', el => el.textContent);
        console.log(`Order Total: ${orderTotal}`);
        expect(orderTotal).to.include('$20');

        await browser.close();
    });
});
