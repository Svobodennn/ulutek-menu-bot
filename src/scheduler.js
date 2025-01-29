const schedule = require('node-schedule');
const { scrapeMenu } = require('./scraper');

function setupScheduler(whatsappClient) {
    // Schedule menu scraping and sending every weekday at 9:00 AM
    const job = schedule.scheduleJob('0 9 * * 1-5', async () => {
        try {
            console.log('Scheduled job running: Fetching and sending menu...');
            const menuMessage = await scrapeMenu();
            
            if (menuMessage) {
                await whatsappClient.sendMessage(
                    process.env.GROUP_JID,
                    { text: menuMessage }
                );
                console.log('Menu sent successfully!');
            }
        } catch (error) {
            console.error('Error in scheduled job:', error);
        }
    });

    console.log('Scheduler setup complete. Menu will be sent at 9:00 AM on weekdays.');
    return job;
}

module.exports = { setupScheduler }; 