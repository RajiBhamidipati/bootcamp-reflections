const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureDesign() {
    console.log('🎨 Capturing current design...');
    
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 1600 });
        
        // Navigate to the live site
        await page.goto('https://bootcamp-reflections.vercel.app', {
            waitUntil: 'networkidle2'
        });
        
        // Wait for the page to load
        await page.waitForTimeout(3000);
        
        // Try to click on Daily Reflection if it exists
        try {
            await page.click('button:has-text("Daily Reflection")');
            await page.waitForTimeout(2000);
        } catch (e) {
            console.log('No Daily Reflection button found, continuing...');
        }
        
        // Take screenshot
        const screenshotPath = path.join(__dirname, 'current-design.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        
        console.log('✅ Design captured:', screenshotPath);
        
        await browser.close();
        
    } catch (error) {
        console.error('❌ Error capturing design:', error.message);
        console.log('💡 Alternative: Visit https://bootcamp-reflections.vercel.app manually');
    }
}

captureDesign();