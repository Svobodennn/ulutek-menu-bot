const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');

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

    // Handle connection events
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = 
                (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log('Connection closed due to:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);

            if (shouldReconnect) {
                await startWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connection established!');
        }
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);

    return sock;
}

module.exports = { startWhatsApp }; 