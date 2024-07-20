const puppeteer = require('puppeteer');

async function loginAutomation() {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false }); // Set headless: true for headless mode
    const page = await browser.newPage();
    
    // Navigate to the login page
    await page.goto('http://localhost:3000'); // Change this to your application's URL
    
    // Type the username and password
    await page.type('input[name="username"]', 'user');
    await page.type('input[name="password"]', 'password');
    
    // Click the login button
    await page.click('button[type="submit"]');
    
    // Wait for the login to complete (you might need to adjust the selector or timeout)
    await page.waitForSelector('.login-success-message', { timeout: 5000 }); // Change the selector to the element that appears on successful login
    
    // Check if the login was successful
    const successMessage = await page.$eval('.login-success-message', el => el.textContent);
    if (successMessage.includes('Login successful')) {
        console.log('Login successful');
    } else {
        console.log('Login failed');
    }
    
    // Close the browser
    await browser.close();
}

loginAutomation().catch(console.error);
