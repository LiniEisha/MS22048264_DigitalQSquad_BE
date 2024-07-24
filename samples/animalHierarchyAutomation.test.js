// File: animalHierarchyAutomation.test.js
import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('Animal Hierarchy Automation Tests', function() {
    this.timeout(10000); // Increase timeout to 10 seconds

    it('should interact with the animal hierarchy system', async function() {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // URL for the animal hierarchy application
        const url = 'http://localhost:4000/animalHierarchy';

        // Go to the animal hierarchy page and wait for it to load
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Example interaction with the page to verify the Animal hierarchy
        const dogSoundButton = await page.waitForSelector('button#showDogSound');
        await dogSoundButton.click();
        
        const dogSound = await page.$eval('#dogSound', el => el.textContent);
        console.log(`Dog Sound: ${dogSound}`);
        expect(dogSound).to.include('barks');

        await browser.close();
    });
});
