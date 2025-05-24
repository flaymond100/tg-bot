require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const botLogic = require("./botLogic");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  botLogic.handleStart(bot, msg);
});

bot.onText(/Зроблено ✅/, (msg) => {
  botLogic.handleDone(bot, msg);
});
