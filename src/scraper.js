const puppeteer = require('puppeteer');

const MENU_URL = 'https://ulutek.com.tr/yemek-liste';

async function scrapeMenu() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.goto(MENU_URL, { waitUntil: 'networkidle0' });

        // Get today's date to find the correct menu
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return "No menu available on weekends.";
        }

        // Extract menu data from the page
        const menuData = await page.evaluate((dayOfWeek) => {
            const rows = document.querySelectorAll('table tr');
            let todayMenu = null;

            // Find today's menu in the table
            for (let row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= dayOfWeek) {
                    const menuItems = [];
                    let totalCalories = 0;

                    // Process each menu item
                    for (let i = 0; i < cells.length; i += 2) {
                        const item = cells[i]?.textContent?.trim();
                        const calories = parseInt(cells[i + 1]?.textContent?.trim() || '0');
                        
                        if (item && !isNaN(calories)) {
                            menuItems.push({ item, calories });
                            totalCalories += calories;
                        }
                    }

                    if (menuItems.length > 0) {
                        todayMenu = { items: menuItems, totalCalories };
                        break;
                    }
                }
            }

            return todayMenu;
        }, dayOfWeek);

        if (!menuData) {
            return "Could not find today's menu.";
        }

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
        
        return message;

    } catch (error) {
        console.error('Error scraping menu:', error);
        return "Error fetching the menu. Please try again later.";
    } finally {
        await browser.close();
    }
}

module.exports = { scrapeMenu }; 