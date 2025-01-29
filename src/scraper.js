const puppeteer = require('puppeteer');

const MENU_URL = 'https://ulutek.com.tr/yemek-liste';

async function scrapeMenu() {
    console.log('\nStarting menu scraping...');
    console.log(`Accessing URL: ${MENU_URL}`);
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080'
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Set longer timeout and add error logging
        await page.setDefaultNavigationTimeout(60000);
        await page.setViewport({ width: 1920, height: 1080 });
        
        page.on('console', msg => console.log('Browser console:', msg.text()));
        page.on('error', err => console.error('Browser error:', err));
        
        // Add request interception for debugging
        await page.setRequestInterception(true);
        page.on('request', request => {
            console.log(`Request: ${request.url()}`);
            request.continue();
        });
        
        console.log('Navigating to page...');
        const response = await page.goto(MENU_URL, { 
            waitUntil: ['networkidle0', 'domcontentloaded'],
            timeout: 60000 
        });
        
        if (!response.ok()) {
            throw new Error(`Failed to load page: ${response.status()} ${response.statusText()}`);
        }
        
        console.log('Page loaded successfully');
        console.log('Waiting for table to be visible...');
        
        // Wait for table to be visible
        await page.waitForSelector('table', { timeout: 10000 })
            .catch(() => console.log('Table selector timeout - continuing anyway'));
            
        // Get today's date to find the correct menu
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        console.log(`Current day of week: ${dayOfWeek}`);
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return "No menu available on weekends.";
        }

        // Take a screenshot for debugging
        await page.screenshot({ 
            path: 'debug-screenshot.png',
            fullPage: true
        });
        console.log('Debug screenshot saved as debug-screenshot.png');

        // Get page content for debugging
        const pageContent = await page.content();
        console.log('Page HTML length:', pageContent.length);
        if (pageContent.includes('table')) {
            console.log('Found table tag in HTML');
        } else {
            console.log('No table tag found in HTML');
        }

        // Extract menu data from the page
        console.log('Extracting menu data...');
        const menuData = await page.evaluate(() => {
            console.log('Looking for menu table...');
            const table = document.querySelector('table');
            if (!table) {
                console.log('No table found');
                return null;
            }

            // Find the cell with today's date (29)
            const dateCell = Array.from(table.querySelectorAll('td')).find(
                cell => cell.textContent.trim() === '29'
            );

            if (!dateCell) {
                console.log('Could not find today\'s date cell');
                return null;
            }

            // Get the column index of today's menu
            const dateRow = dateCell.parentElement;
            const columnIndex = Array.from(dateRow.children).indexOf(dateCell);
            console.log(`Found today's menu in column ${columnIndex}`);

            // Find the starting row for menu items
            const startRow = dateRow.nextElementSibling;
            if (!startRow) {
                console.log('Could not find menu items');
                return null;
            }

            const menuItems = [];
            let totalCalories = 0;
            let currentRow = startRow;

            // Get the next 5 rows which contain the menu items
            for (let i = 0; i < 5 && currentRow; i++) {
                const cells = Array.from(currentRow.querySelectorAll('td'));
                const itemCell = cells[columnIndex];
                const calorieCell = cells[columnIndex + 1];

                if (itemCell && calorieCell) {
                    const item = itemCell.textContent.trim();
                    const calories = parseInt(calorieCell.textContent.trim()) || 0;

                    if (item) {
                        menuItems.push({ item, calories });
                        totalCalories += calories;
                        console.log(`Found menu item: ${item} (${calories} kcal)`);
                    }
                }

                currentRow = currentRow.nextElementSibling;
            }

            return { items: menuItems, totalCalories };
        });

        if (!menuData) {
            console.log('No menu data found');
            return "Could not find today's menu.";
        }

        console.log('Menu data found:', menuData);

        // Format the menu message
        const date = today.toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        let message = `📅 ${date}\n🍽️ Today's Menu:\n\n`;
        
        menuData.items.forEach((item, index) => {
            const emoji = ['🥣', '🍖', '🥗', '🍚', '🍰'][index] || '•';
            message += `${emoji} ${item.item} (${item.calories} kcal)\n`;
        });

        message += `\nTotal Calories: ${menuData.totalCalories} kcal`;
        
        console.log('Final formatted message:', message);
        return message;

    } catch (error) {
        console.error('Error scraping menu:', error);
        return "Error fetching the menu. Please try again later.";
    } finally {
        await browser.close();
        console.log('Browser closed');
    }
}

module.exports = { scrapeMenu }; 