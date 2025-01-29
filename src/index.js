require('dotenv').config();
const { startWhatsApp } = require('./whatsapp');
const { setupScheduler } = require('./scheduler');
const { scrapeMenu } = require('./scraper');

async function main() {
    try {
        console.log('Starting WhatsApp bot...');
        
        // Initialize WhatsApp connection and wait for it to be ready
        const whatsappClient = await startWhatsApp();
        console.log('WhatsApp client is ready!');
        
        // Setup scheduler for daily menu updates
        setupScheduler(whatsappClient);
        
        // For testing: Immediately scrape and send today's menu
        console.log('Fetching today\'s menu...');
        const todayMenu = await scrapeMenu();
        
        if (todayMenu && process.env.GROUP_JID) {
            console.log('Sending menu to group...');
            await whatsappClient.sendMessage(
                process.env.GROUP_JID,
                { text: todayMenu }
            );
            console.log('Menu sent successfully!');
        } else {
            console.log('Could not send menu:', !todayMenu ? 'No menu available' : 'No GROUP_JID configured');
        }
    } catch (error) {
        console.error('Error in main:', error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

main(); 