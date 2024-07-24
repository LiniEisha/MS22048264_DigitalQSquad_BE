// File: libraryAutomation.test.js
import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('Library Automation Tests', function() {
    it('should interact with the library system', async function() {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // URL for the library system application
        const url = 'http://localhost:3000/librarySystem';

        // Go to the library system page and wait for it to load
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Ensure the title input exists before typing into it
        const titleSelector = 'input[name="title"]';
        await page.waitForSelector(titleSelector, { timeout: 5000 });

        // Example interaction with the page to add a book
        await page.type(titleSelector, 'Book Title');
        await page.type('input[name="year"]', '2022');
        await page.type('input[name="author"]', 'Author Name');
        await page.type('input[name="pages"]', '300');
        await page.select('select[name="type"]', 'Book');
        await page.click('button#addItem');

        // Wait for the result and verify it
        await page.waitForSelector('#itemInfo', { timeout: 5000 });
        const itemInfo = await page.$eval('#itemInfo', el => el.textContent);
        console.log(`Item Info: ${itemInfo}`);
        expect(itemInfo).to.include('Book Title (2022) by Author Name, 300 pages');

        // Close the browser
        await browser.close();
    });
});
