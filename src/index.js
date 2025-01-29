require('dotenv').config();
const { startWhatsApp } = require('./whatsapp');
const { setupScheduler } = require('./scheduler');
const { scrapeMenu } = require('./scraper');

async function main() {
    try {
        // Initialize WhatsApp connection
        const whatsappClient = await startWhatsApp();
        
        // Setup scheduler for daily menu updates
        setupScheduler(whatsappClient);
        
        // For testing: Immediately scrape and send today's menu
        const todayMenu = await scrapeMenu();
        if (todayMenu) {
            await whatsappClient.sendMessage(
                process.env.GROUP_JID,
                { text: todayMenu }
            );
        }
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main(); 