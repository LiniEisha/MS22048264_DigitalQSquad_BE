// File: ticketingAutomation.test.js
import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('Ticket Booking System Automation Tests', function() {
    this.timeout(10000); // Increase timeout to 10 seconds

    it('should book a ticket', async function() {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // URL for the ticket booking system application
        const url = 'http://localhost:3000/ticketBookingSystem';

        // Go to the ticket booking system page and wait for it to load
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Ensure the flightId input exists before typing into it
        const flightIdSelector = 'input[name="flightId"]';
        await page.waitForSelector(flightIdSelector, { timeout: 5000 });

        // Example interaction with the page to book a ticket
        await page.type(flightIdSelector, 'FL123');
        await page.type('input[name="userId"]', 'USER1');
        await page.select('select[name="ticketClass"]', 'Economy');
        await page.click('button#bookTicket');

        // Wait for the result and verify it
        await page.waitForSelector('#bookingStatus', { timeout: 5000 });
        const bookingStatus = await page.$eval('#bookingStatus', el => el.textContent);
        console.log(`Booking Status: ${bookingStatus}`);
        expect(bookingStatus).to.include('Ticket booked');

        await browser.close();
    });
});
