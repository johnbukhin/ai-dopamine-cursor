const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = '/Users/yevhen/cursor-projects/ClaudeCode/finestro-funnel-screenshots';
const URL = 'https://finestro.io/quiz-fr-v05?utm_source=%7B%7Bsite_source_name%7D%7D&utm_medium=%7B%7Bplacement%7D%7D&utm_campaign=%7B%7Bcampaign.name%7D%7D&AdSetName=%7B%7Badset.name%7D%7D&AdName=%7B%7Bad.name%7D%7D&CampaignID=%7B%7Bcampaign.id%7D%7D&AdSetID=%7B%7Badset.id%7D%7D&AdID=%7B%7Bad.id%7D%7D';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name, index) {
    const filename = `${String(index).padStart(2, '0')}-${name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`Saved: ${filename}`);
    return filepath;
}

async function findAndClickOption(page, optionIndex = 0) {
    // Wait for content to load
    await delay(1500);

    // Find clickable option divs (quiz answers typically)
    const options = await page.$$eval('div', divs => {
        return divs
            .filter(d => {
                const text = d.innerText?.trim();
                const hasShortText = text && text.length > 0 && text.length < 100 && !text.includes('\n');
                const style = window.getComputedStyle(d);
                const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
                const hasClickHandler = d.onclick || d.getAttribute('role') === 'button';
                return hasShortText && isVisible;
            })
            .map(d => ({
                text: d.innerText?.trim(),
                rect: d.getBoundingClientRect()
            }));
    });

    console.log('Found options:', options.map(o => o.text));
    return options;
}

async function clickFirstOption(page) {
    await delay(1000);

    // Try to find and click on option-like elements
    const clicked = await page.evaluate(() => {
        // Look for common quiz answer patterns
        const selectors = [
            '[class*="option"]',
            '[class*="answer"]',
            '[class*="choice"]',
            '[class*="card"]',
            '[role="button"]',
            'button'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
                const text = el.innerText?.trim();
                if (text && text.length > 0 && text.length < 50) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 50 && rect.height > 20 && rect.top > 100) {
                        el.click();
                        return text;
                    }
                }
            }
        }

        // Fallback: find divs that look like options
        const divs = document.querySelectorAll('div');
        for (const div of divs) {
            const text = div.innerText?.trim();
            if (text && text.length > 2 && text.length < 50 && !text.includes('\n')) {
                const rect = div.getBoundingClientRect();
                const style = window.getComputedStyle(div);
                if (rect.width > 100 && rect.height > 30 && rect.top > 200 &&
                    style.cursor === 'pointer') {
                    div.click();
                    return text;
                }
            }
        }

        return null;
    });

    return clicked;
}

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=375,812']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });

    console.log('Navigating to funnel...');
    await page.goto(URL, { waitUntil: 'networkidle2' });

    let screenshotIndex = 1;
    let lastUrl = page.url();
    let sameUrlCount = 0;
    const maxScreenshots = 30;

    // Capture landing page
    await delay(2000);
    await takeScreenshot(page, 'landing', screenshotIndex++);

    while (screenshotIndex <= maxScreenshots) {
        const currentUrl = page.url();

        // Check if URL changed
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            sameUrlCount = 0;
        } else {
            sameUrlCount++;
            if (sameUrlCount > 5) {
                console.log('Stuck on same page, trying to find next action...');
            }
        }

        // Try to click an option
        const clicked = await clickFirstOption(page);

        if (clicked) {
            console.log(`Clicked: "${clicked}"`);
            await delay(2000);
            await takeScreenshot(page, `step-${screenshotIndex}`, screenshotIndex);
            screenshotIndex++;
        } else {
            // Check for input fields (email, name)
            const hasInput = await page.evaluate(() => {
                const inputs = document.querySelectorAll('input[type="email"], input[type="text"], input[name="email"]');
                return inputs.length > 0;
            });

            if (hasInput) {
                console.log('Found input field, filling with test data...');
                try {
                    await page.type('input[type="email"], input[name="email"]', 'test@testtest1.com');
                    await delay(500);

                    // Look for submit button
                    await page.evaluate(() => {
                        const buttons = document.querySelectorAll('button, [type="submit"]');
                        for (const btn of buttons) {
                            if (btn.innerText?.toLowerCase().includes('continue') ||
                                btn.innerText?.toLowerCase().includes('next') ||
                                btn.innerText?.toLowerCase().includes('get') ||
                                btn.innerText?.toLowerCase().includes('start')) {
                                btn.click();
                                return true;
                            }
                        }
                        return false;
                    });

                    await delay(2000);
                    await takeScreenshot(page, `form-${screenshotIndex}`, screenshotIndex);
                    screenshotIndex++;
                } catch (e) {
                    console.log('Form fill error:', e.message);
                }
            } else {
                // Check for paywall or end
                const pageText = await page.evaluate(() => document.body.innerText?.substring(0, 500));
                if (pageText?.toLowerCase().includes('price') ||
                    pageText?.toLowerCase().includes('payment') ||
                    pageText?.toLowerCase().includes('subscribe') ||
                    pageText?.toLowerCase().includes('checkout')) {
                    console.log('Reached paywall/checkout');
                    await takeScreenshot(page, 'paywall', screenshotIndex);
                    break;
                }

                console.log('No clickable option found, waiting...');
                await delay(2000);

                if (sameUrlCount > 10) {
                    console.log('Ending capture - no more options found');
                    break;
                }
            }
        }
    }

    console.log(`\nCapture complete! ${screenshotIndex - 1} screenshots saved.`);
    await browser.close();
}

main().catch(console.error);
