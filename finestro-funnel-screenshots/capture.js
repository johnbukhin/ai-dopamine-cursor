const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOT_DIR = '/Users/yevhen/cursor-projects/ClaudeCode/finestro-funnel-screenshots';
const URL = 'https://finestro.io/quiz-fr-v05';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, index, name) {
    const filename = `${String(index).padStart(2, '0')}-${name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`✓ Saved: ${filename}`);
    return filepath;
}

async function getPageContent(page) {
    return await page.evaluate(() => document.body.innerText?.substring(0, 800) || '');
}

async function clickOptionByText(page, textPatterns) {
    for (const pattern of textPatterns) {
        try {
            const clicked = await page.evaluate((p) => {
                const allEls = Array.from(document.querySelectorAll('div, span, button, label, a'));
                for (const el of allEls) {
                    const text = el.innerText?.trim();
                    if (text && (text === p || text.startsWith(p))) {
                        // Find the clickable parent (usually has cursor:pointer or is a label)
                        let target = el;
                        for (let i = 0; i < 3; i++) {
                            if (target.parentElement) {
                                const style = window.getComputedStyle(target.parentElement);
                                if (style.cursor === 'pointer') {
                                    target = target.parentElement;
                                }
                            }
                        }
                        target.click();
                        return text.substring(0, 40);
                    }
                }
                return null;
            }, pattern);

            if (clicked) {
                console.log(`👆 Clicked: "${clicked}"`);
                return true;
            }
        } catch (e) {}
    }
    return false;
}

async function clickFirstAvailableOption(page) {
    // Get all potential clickable options
    const result = await page.evaluate(() => {
        const options = [];
        const allEls = Array.from(document.querySelectorAll('div, label, button'));

        for (const el of allEls) {
            const text = el.innerText?.trim();
            const rect = el.getBoundingClientRect();

            // Skip if no text, too long, contains newlines, or not visible
            if (!text || text.length > 80 || text.length < 2 || text.includes('\n') ||
                rect.width < 50 || rect.height < 20 || rect.top < 100 || rect.top > 700) continue;

            // Skip non-option texts
            const lower = text.toLowerCase();
            if (lower.includes('by continuing') || lower.includes('terms') ||
                lower.includes('privacy') || lower.includes('refund') ||
                lower.includes('policy') || lower.includes('finestro')) continue;

            // Check if it looks like an option
            const style = window.getComputedStyle(el);
            const isClickable = style.cursor === 'pointer' ||
                el.tagName === 'BUTTON' ||
                el.tagName === 'LABEL' ||
                el.getAttribute('role') === 'button';

            if (isClickable || text.toUpperCase() === text || text === 'CONTINUE') {
                options.push({
                    text: text,
                    tag: el.tagName,
                    top: rect.top,
                    centerX: rect.left + rect.width / 2,
                    centerY: rect.top + rect.height / 2
                });
            }
        }

        // Sort by vertical position
        options.sort((a, b) => a.top - b.top);
        return options.slice(0, 10);
    });

    console.log(`   Options found: ${result.map(o => o.text.substring(0, 25)).join(' | ')}`);

    // Click the first option using coordinates
    if (result.length > 0) {
        const opt = result[0];
        await page.mouse.click(opt.centerX, opt.centerY);
        console.log(`👆 Clicked at (${Math.round(opt.centerX)}, ${Math.round(opt.centerY)}): "${opt.text.substring(0, 40)}"`);
        return true;
    }

    return false;
}

async function main() {
    console.log('🚀 Starting funnel capture...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 375, height: 812, deviceScaleFactor: 2 },
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1');

    console.log('📱 Navigating to funnel...');
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000);

    let index = 1;
    const maxSteps = 50;
    let lastContent = '';
    let stuckCount = 0;
    let errorCount = 0;

    while (index <= maxSteps) {
        // Get page content
        const content = await getPageContent(page);

        // Check for errors
        if (content.includes('Something went wrong')) {
            errorCount++;
            console.log(`\n⚠️ Error page detected (${errorCount}/3)`);
            if (errorCount >= 3) {
                console.log('❌ Too many errors, stopping');
                break;
            }
            // Click "Try again"
            await page.evaluate(() => {
                const btn = Array.from(document.querySelectorAll('button, div')).find(e => e.innerText?.includes('Try again'));
                if (btn) btn.click();
            });
            await delay(3000);
            continue;
        }

        errorCount = 0; // Reset error count on successful page

        // Check if content changed
        if (content !== lastContent) {
            stuckCount = 0;
            lastContent = content;

            // Take screenshot
            const shortContent = content.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 30);
            await takeScreenshot(page, index++, shortContent || `step-${index}`);
            console.log(`📄 Content: ${content.substring(0, 100).replace(/\n/g, ' ')}...`);

            // Check for ACTUAL paywall (contains specific price amounts)
            if (content.match(/€\d+[.,]?\d*|£\d+[.,]?\d*|\$\d+[.,]?\d*/)) {
                console.log('\n💰 PAYWALL DETECTED - Found actual prices!');

                // Scroll and capture more of the paywall
                for (let scroll = 1; scroll <= 5; scroll++) {
                    await page.evaluate(() => window.scrollBy(0, 350));
                    await delay(500);
                    const scrollContent = await getPageContent(page);
                    if (scrollContent !== content) {
                        await takeScreenshot(page, index++, `paywall-scroll-${scroll}`);
                    }
                }
                break;
            }
        } else {
            stuckCount++;
            if (stuckCount > 3) {
                console.log('⚠️ Stuck on same page...');
            }
            if (stuckCount > 6) {
                console.log('❌ Breaking - page not changing');
                break;
            }
        }

        // Try to click an option
        await delay(1500);
        const clicked = await clickFirstAvailableOption(page);

        if (!clicked) {
            // Check for input fields
            const hasInput = await page.evaluate(() => {
                const inputs = document.querySelectorAll('input:not([type="hidden"])');
                return inputs.length > 0;
            });

            if (hasInput) {
                console.log('📧 Found input field, filling...');
                try {
                    await page.type('input[type="email"], input[name="email"], input', 'test@testtest1.com', { delay: 50 });
                    await delay(500);
                    // Try to submit
                    await page.evaluate(() => {
                        const btn = document.querySelector('button');
                        if (btn) btn.click();
                    });
                } catch (e) {
                    console.log('   Input fill failed');
                }
            }
        }

        await delay(2000);
    }

    console.log(`\n✅ Capture complete! ${index - 1} screenshots saved.`);
    console.log(`📁 Location: ${SCREENSHOT_DIR}`);

    // Keep browser open briefly to see final state
    await delay(2000);
    await browser.close();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
