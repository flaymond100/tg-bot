const fs = require("fs");

let users = {};

if (fs.existsSync("./users.json")) {
  users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
}

const workouts = [
  "День 1: 15 присідань, 10 віджимань, 20 сек планки.",
  "День 2: ...",
  // і т. д. до 7
];

function saveUsers() {
  fs.writeFileSync("./users.json", JSON.stringify(users));
}

function handleStart(bot, msg) {
  const id = msg.chat.id;

  if (!users[id]) {
    users[id] = { day: 0 };
    saveUsers();
  }

  bot.sendMessage(
    id,
    `Привіт! Починаємо 7-денний челендж. Натисни "Зроблено ✅", щойно завершиш вправи.`
  );
  sendWorkout(bot, id);
}

function sendWorkout(bot, id) {
  const day = users[id].day;

  if (day >= workouts.length) {
    bot.sendMessage(
      id,
      `Ти завершив безкоштовний челендж! Хочеш продовжити? Ось твій наступний крок...`
    );
    // тут вставити Stripe посилання
  } else {
    bot.sendMessage(id, workouts[day], {
      reply_markup: {
        keyboard: [["Зроблено ✅"]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
}

function handleDone(bot, msg) {
  const id = msg.chat.id;

  if (!users[id]) return;

  users[id].day += 1;
  saveUsers();

  bot.sendMessage(id, `Красава! Готуйся до наступного дня 💪`);
  sendWorkout(bot, id);
}

module.exports = { handleStart, handleDone };
