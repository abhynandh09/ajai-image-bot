import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const GEMINI_KEY = process.env.GEMINI_KEY;
const HF_TOKEN = process.env.HF_TOKEN;

if (!BOT_TOKEN || !GEMINI_KEY || !HF_TOKEN) {
  console.log("Missing environment variables");
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;
  if (!userText) return;

  await bot.sendMessage(chatId, "🧠 Image generate cheyyunnu… 😮‍💨");

  try {
    // 1️⃣ Gemini – prompt improve
    const gRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Improve this image prompt in detail: ${userText}` }]
          }]
        })
      }
    );

    const gData = await gRes.json();
    const prompt =
      gData.candidates?.[0]?.content?.parts?.[0]?.text || userText;

    // 2️⃣ HuggingFace – image generate
    const imgRes = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    await bot.sendPhoto(chatId, buffer);

  } catch (err) {
    await bot.sendMessage(chatId, "❌ Image generate cheyyan pattiyilla 😮‍💨");
  }
});

console.log("AJAI Image Bot running 🤖");
