const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const qrcode = require('qrcode-terminal');

async function listGroups(sock) {
    try {
        const groups = await sock.groupFetchAllParticipating();
        console.log('\nAvailable WhatsApp Groups:');
        console.log('============================');
        
        Object.entries(groups).forEach(([id, group]) => {
            console.log(`\nGroup Name: ${group.subject}`);
            console.log(`Group JID: ${id}`);
            console.log('----------------------------');
        });
        
        console.log('\nCopy the Group JID of your desired group and add it to your .env file\n');
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
}

async function startWhatsApp() {
    // Use auth state
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        // Browser identification
        browser: ['Ulutek Menu Bot', 'Chrome', '1.0.0']
    });

    // Save credentials whenever updated
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)? 
                lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                : true;
            
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            
            if (shouldReconnect) {
                await startWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connection opened!');
            // List available groups after successful connection
            await listGroups(sock);
        }
    });

    return sock;
}

module.exports = { startWhatsApp };