require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

let users = {};

// Завантаження бази
if (fs.existsSync("./users.json")) {
  users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
}

// Контент челенджу (7 днів)
const workouts = [
  // День 1
  "🗓️ *День 1: Просто з’явись*\n\n" +
    "Розминка:\n▫️ 30 сек біг на місці\n▫️ 20 стрибків з підйомом колін\n\n" +
    "Основне:\n" +
    "1. 15 присідань\n" +
    "2. 10 віджимань\n" +
    "3. 20 сек планки\n" +
    "4. 15 підйомів колін стоячи\n" +
    "5. 30 сек стрибків на місці\n\n" +
    "_Думка: Ти не мусиш бути ідеальним. Але мусиш з’явитись._",

  // День 2
  "🗓️ *День 2: Стабільність*\n\n" +
    "1. 10 випадів на кожну ногу\n" +
    "2. 10 віджимань з паузою\n" +
    "3. 30 сек бокової планки (по 15 сек на бік)\n" +
    "4. 20 присідань сумо\n" +
    "5. 30 сек «стілець» біля стіни\n\n" +
    "_Думка: Прості дії — сильні результати._",

  // День 3
  "🗓️ *День 3: Ритм*\n\n" +
    "1. 15 берпі (повільно)\n" +
    "2. 20 присідань\n" +
    "3. 10 зіркових стрибків\n" +
    "4. 30 сек бігу на місці\n" +
    "5. 15 випадів у бік\n\n" +
    "_Думка: Дихай. Рухайся. Повертайся до себе._",

  // День 4
  "🗓️ *День 4: Сила*\n\n" +
    "1. 20 присідань із зупинкою внизу\n" +
    "2. 15 віджимань\n" +
    "3. 45 сек планки\n" +
    "4. 20 скручувань на прес\n" +
    "5. 30 сек «лодочка» на спині\n\n" +
    "_Думка: Міцність — це звичка._",

  // День 5
  "🗓️ *День 5: Швидкість і фокус*\n\n" +
    "1. Табата: 20 сек присідання — 10 сек пауза\n" +
    "2. Табата: 20 сек берпі — 10 сек пауза\n" +
    "3. Табата: 20 сек віджимання — 10 сек пауза\n" +
    "4. Табата: 20 сек скручування — 10 сек пауза\n" +
    "5. Планка 30 сек\n\n" +
    "_Думка: Збери себе докупи._",

  // День 6
  "🗓️ *День 6: Пауза з рухом*\n\n" +
    "1. 30 сек дихальна вправа (глибокі вдихи/видихи)\n" +
    "2. Розтяжка шиї — 30 сек\n" +
    "3. Нахили вперед — 20 сек\n" +
    "4. Розтяжка квадрицепсів стоячи — 20 сек на ногу\n" +
    "5. Вправа «кішка-корова» — 10 разів\n\n" +
    "_Думка: Відновлення — це теж тренування._",

  // День 7
  "🗓️ *День 7: Ти в грі!*\n\n" +
    "1. 15 присідань\n" +
    "2. 10 віджимань\n" +
    "3. 30 сек планка\n" +
    "4. 15 берпі\n" +
    "5. 30 сек «стілець» біля стіни\n\n" +
    "_Ти зробив це! Готовий продовжити?\n👉 [Придбати 30-денний план](https://your-stripe-link.com)_",
];

// Зберегти БД
function saveUsers() {
  fs.writeFileSync("./users.json", JSON.stringify(users));
}

// Зберегти БД
function saveUsers() {
  fs.writeFileSync("./users.json", JSON.stringify(users));
}

// Перевірка, чи минув наступний день
function isNextDayAvailable(user) {
  if (!user.lastCompletedAt) return true;

  const last = new Date(user.lastCompletedAt);
  const now = new Date();

  return (
    now.getUTCFullYear() > last.getUTCFullYear() ||
    now.getUTCMonth() > last.getUTCMonth() ||
    now.getUTCDate() > last.getUTCDate()
  );
}

// /start
bot.onText(/\/start/, (msg) => {
  const id = msg.chat.id;

  if (!users[id]) {
    users[id] = { day: 0, lastCompletedAt: null };
    saveUsers();
  }

  bot.sendMessage(
    id,
    `Привіт, ${msg.from.first_name}! 👋\n\nРозпочнемо 7-денний фітнес-челендж?\nКожного дня — нове коротке тренування 💪`,
    {
      reply_markup: {
        keyboard: [["Почати"]],
        resize_keyboard: true,
      },
    }
  );
});

// натиснув “Почати”
bot.onText(/Почати/, (msg) => {
  const id = msg.chat.id;
  const user = users[id];
  if (!user) return;

  if (!isNextDayAvailable(user) && user.day > 0 && user.day < workouts.length) {
    bot.sendMessage(
      id,
      "⏳ Наступне тренування буде доступне завтра. Повертайся пізніше 💪"
    );
  } else {
    sendWorkout(id);
  }
});

// натиснув “Зроблено ✅”
bot.onText(/Зроблено ✅/, (msg) => {
  const id = msg.chat.id;
  const user = users[id];
  if (!user) return;

  user.lastCompletedAt = new Date().toISOString();
  user.day += 1;
  saveUsers();

  if (user.day >= workouts.length) {
    bot.sendMessage(
      id,
      "🎉 Ти завершив челендж! 🔥\n\n👉 Хочеш продовжити?\n[Придбати 30-денний план](https://your-stripe-link.com)",
      {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }
    );
  } else {
    bot.sendMessage(id, "Готово! Наступне тренування відкриється завтра 💥");
  }
});

// відправка вправи
function sendWorkout(id) {
  const user = users[id];
  const day = user.day;

  const text = workouts[day] || "Ти завершив всі дні!";
  bot.sendMessage(id, text, {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [["Зроблено ✅"]],
      resize_keyboard: true,
    },
  });
}

console.log("🤖 Бот запущено через long polling...");
