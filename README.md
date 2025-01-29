# Ulutek Menu Bot

A WhatsApp bot that automatically fetches and sends the daily menu from Ulutek's website to a specified WhatsApp group.

## Features

- 🔄 Automatically fetches daily menu from Ulutek's website
- 📱 Sends menu to a specified WhatsApp group
- 🔌 Persistent WhatsApp connection (only need to scan QR code once)
- 🚀 Auto-startup with Windows
- 📅 Shows menu items with calories
- 🔄 Auto-reconnect on connection loss

## Setup Instructions

### Prerequisites

1. Node.js installed on your computer
2. A WhatsApp account
3. Member of the target WhatsApp group

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Create a `.env` file in the project root
2. Start the bot for the first time:
   ```bash
   npm start
   ```
3. Scan the QR code with WhatsApp (only needed once)
4. The bot will display a list of available WhatsApp groups
5. Copy the Group JID of your desired group
6. Add the Group JID to your `.env` file:
   ```
   GROUP_JID="your-group-jid-here"
   ```

### Auto-Start Setup

1. The `start-bot.bat` file is included in the project
2. To enable auto-start:
   - Press `Windows + R`
   - Type `shell:startup`
   - Copy `start-bot.bat` from the project folder
   - Paste it into the startup folder

## How It Works

- The bot connects to WhatsApp using your account
- It scrapes the Ulutek website daily for the menu
- Formats the menu with emojis and calorie information
- Sends it to the configured WhatsApp group
- The connection is persistent (saved in `auth_info` folder)

## Troubleshooting

- If the bot disconnects, it will automatically try to reconnect
- If you need to rescan the QR code:
  1. Delete the `auth_info` folder
  2. Restart the bot
- If the menu isn't being sent:
  1. Check your internet connection
  2. Verify the GROUP_JID in .env file
  3. Ensure you're still a member of the group

## Notes

- The bot saves authentication state in the `auth_info` folder
- You typically only need to scan the QR code once
- The bot will automatically start with Windows if configured
- Menu is fetched from: https://ulutek.com.tr/yemek-liste

## Support

If you encounter any issues or need help, please:
1. Check the troubleshooting section
2. Verify your configuration
3. Ensure all dependencies are installed
4. Check the console output for error messages 