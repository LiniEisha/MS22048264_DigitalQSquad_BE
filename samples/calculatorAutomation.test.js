// File: calculatorAutomation.test.js
import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('Calculator Automation Tests', function() {
    it('should perform addition operation', async function() {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // URL for the calculator application
        const url = 'http://localhost:4000/calculator';

        // Go to the calculator page
        await page.goto(url);

        // Example interaction with the page to perform an addition operation
        await page.type('input[name="firstNumber"]', '5');
        await page.type('input[name="secondNumber"]', '3');
        await page.select('select[name="operation"]', 'add');
        await page.click('button#calculate');

        // Wait for the result and verify it
        await page.waitForSelector('#result', { timeout: 5000 });
        const result = await page.$eval('#result', el => el.textContent);
        console.log(`Result: ${result}`);
        expect(result).to.include('8');

        await browser.close();
    });
});
