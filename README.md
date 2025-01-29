# Ulutek Menu WhatsApp Bot

A Node.js application that scrapes the daily menu from Ulutek Teknopark's website and automatically sends it to a WhatsApp group using the Baileys WhatsApp Web API.

## Features

- 🍽️ Scrapes daily menu from [Ulutek Teknopark's website](https://ulutek.com.tr/yemek-liste)
- 📱 Automatically sends menu to WhatsApp group
- 🕒 Scheduled daily notifications
- 📊 Includes calorie information for each meal
- 🗓️ Supports weekly menu viewing

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A WhatsApp account for the bot
- Chrome/Chromium (for web scraping)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ulutek-menu-bot.git
cd ulutek-menu-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
GROUP_JID=your_whatsapp_group_jid
SCHEDULE_TIME=09:00 # Time to send menu notification
```

## Dependencies

- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- puppeteer - Web scraping
- node-schedule - Task scheduling
- dotenv - Environment configuration

## Usage

1. Start the bot:
```bash
npm start
```

2. Scan the QR code with WhatsApp to authenticate

The bot will automatically:
- Scrape the menu at scheduled times
- Format the menu data
- Send it to the configured WhatsApp group

## Menu Format

The bot sends messages in the following format:

```
📅 [Day's Date]
🍽️ Today's Menu:

🥣 Soup: [Soup Name] ([Calories] kcal)
🍖 Main: [Main Course] ([Calories] kcal)
🥗 Side: [Side Dish] ([Calories] kcal)
🍚 Other: [Other Items] ([Calories] kcal)
🍰 Dessert: [Dessert Name] ([Calories] kcal)

Total Calories: [Total] kcal
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ulutek Teknopark](https://ulutek.com.tr) for providing the menu data
- [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) for the WhatsApp Web API

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 