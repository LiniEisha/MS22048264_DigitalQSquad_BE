// File: searchAutomation.test.js
import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('Search Automation Tests', function() {
    this.timeout(10000); // Increase timeout to 10 seconds

    it('should automate search and click results', async function() {
        const browser = await puppeteer.launch({ headless: false }); // Set headless: true for headless mode
        const page = await browser.newPage();

        // Define categories and their search URLs
        const categories = {
            articles: 'http://localhost:3000/search/articles?keyword=',
            blogs: 'http://localhost:3000/search/blogs?keyword=',
            forums: 'http://localhost:3000/search/forums?keyword='
        };

        for (const category in categories) {
            const url = categories[category] + 'keyword';
            await page.goto(url);
            await page.waitForSelector('.search-result', { timeout: 5000 });

            const results = await page.$$('.search-result');
            if (results.length > 0) {
                await results[0].click();
                await page.waitForSelector('.content', { timeout: 5000 });
                const content = await page.$eval('.content', el => el.textContent);
                console.log(`${category} content: ${content}`);
                expect(content).to.be.a('string');
            } else {
                console.log(`No results found for ${category}`);
            }
        }

        await browser.close();
    });
});
