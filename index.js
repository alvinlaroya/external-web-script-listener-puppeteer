import puppeteer from "puppeteer";

async function run() {
    const siteUrl = 'https://jsonget.netlify.app/';
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.exposeFunction('onJsonDataCaptured', (data) => {
        console.log('getJsonData() was called! Returned value:', data);
    });

    await page.goto(siteUrl, { waitUntil: 'networkidle0' });

    // Override getJsonData to notify Node.js in real-time
    await page.evaluate(() => {
        const originalGetJsonData = window.getJsonData;

        window.getJsonData = function (...args) {
            const result = originalGetJsonData.apply(this, args);

            // Support async (promise) and sync return
            if (result instanceof Promise) {
                result.then(data => {
                    window.onJsonDataCaptured(data);
                });
            } else {
                window.onJsonDataCaptured(result);
            }

            return result;
        };
    });
}

run();
