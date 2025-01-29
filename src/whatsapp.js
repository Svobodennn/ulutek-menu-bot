const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');

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
    // Load auth info
    const { state, saveCreds } = await useMultiFileAuthState(
        path.join(__dirname, '../auth_info')
    );

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        defaultQueryTimeoutMs: undefined
    });

    // Return a promise that resolves when connection is established
    return new Promise((resolve, reject) => {
        // Handle connection events
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const shouldReconnect = 
                    (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

                console.log('Connection closed due to:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);

                if (shouldReconnect) {
                    startWhatsApp().then(resolve).catch(reject);
                } else {
                    reject(lastDisconnect?.error || new Error('Connection closed'));
                }
            } else if (connection === 'open') {
                console.log('WhatsApp connection established!');
                // List available groups after successful connection
                await listGroups(sock);
                resolve(sock);
            }
        });

        // Save credentials on update
        sock.ev.on('creds.update', saveCreds);
    });
}

module.exports = { startWhatsApp }; 