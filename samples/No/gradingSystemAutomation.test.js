// File: gradingSystemAutomation.test.js
import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('Grading System Automation Tests', function() {
    this.timeout(10000); // Increase timeout to 10 seconds

    it('should automate the grading system', async function() {
        const browser = await puppeteer.launch({ headless: false }); // Set headless: true for headless mode
        const page = await browser.newPage();

        // URLs for different operations
        const urls = {
            addStudent: 'http://localhost:3000/addStudent',
            assignScore: 'http://localhost:3000/assignScore',
            generateReport: 'http://localhost:3000/generateReport'
        };

        // Add a student
        await page.goto(urls.addStudent);
        await page.type('input[name="studentId"]', '3');
        await page.type('input[name="name"]', 'Charlie');
        await page.click('button[type="submit"]');
        await page.waitForSelector('.add-success', { timeout: 5000 });

        // Assign scores to the student
        await page.goto(urls.assignScore);
        await page.type('input[name="studentId"]', '3');
        await page.type('input[name="score"]', '70');
        await page.click('button[type="submit"]');
        await page.waitForSelector('.assign-success', { timeout: 5000 });

        await page.type('input[name="score"]', '80');
        await page.click('button[type="submit"]');
        await page.waitForSelector('.assign-success', { timeout: 5000 });

        // Generate and check the report
        await page.goto(urls.generateReport);
        await page.waitForSelector('.report', { timeout: 5000 });
        const reportContent = await page.$eval('.report', el => el.textContent);
        console.log(`Report: ${reportContent}`);
        expect(reportContent).to.include('Charlie');

        await browser.close();
    });
});
