const express = require('express');
const cors = require('cors');
const { startWhatsApp, sendAndPinMessage } = require('./whatsapp');
const { scrapeMenu } = require('./scraper');
const { setupScheduler } = require('./scheduler');

const app = express();
app.use(cors());
app.use(express.json());

let whatsappClient = null;

// Initialize WhatsApp client
async function initializeWhatsApp() {
    if (!whatsappClient) {
        whatsappClient = await startWhatsApp();
        setupScheduler(whatsappClient);
    }
    return whatsappClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', clientConnected: !!whatsappClient });
});

// Initialize WhatsApp connection
app.post('/api/init', async (req, res) => {
    try {
        await initializeWhatsApp();
        res.json({ success: true, message: 'WhatsApp client initialized' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get today's menu
app.get('/api/menu', async (req, res) => {
    try {
        const menu = await scrapeMenu();
        res.json({ success: true, menu });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send menu to group
app.post('/api/send-menu', async (req, res) => {
    try {
        if (!whatsappClient) {
            await initializeWhatsApp();
        }

        const { groupId } = req.body;
        const menu = await scrapeMenu();
        
        if (!menu) {
            return res.status(404).json({ success: false, error: 'Menu not available' });
        }

        await sendAndPinMessage(whatsappClient, groupId || process.env.GROUP_JID, menu);
        res.json({ success: true, message: 'Menu sent and pinned successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List available groups
app.get('/api/groups', async (req, res) => {
    try {
        if (!whatsappClient) {
            await initializeWhatsApp();
        }

        const groups = await whatsappClient.groupFetchAllParticipating();
        const formattedGroups = Object.entries(groups).map(([id, group]) => ({
            id,
            name: group.subject,
            participants: group.participants?.length || 0
        }));

        res.json({ success: true, groups: formattedGroups });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the scheduler
app.post('/api/scheduler/start', async (req, res) => {
    try {
        if (!whatsappClient) {
            await initializeWhatsApp();
        }
        setupScheduler(whatsappClient);
        res.json({ success: true, message: 'Scheduler started' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
}); 