// ==============================
// SETUP AWAL
// ==============================
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

// ==============================
// INIT BOT
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`🤖 Bot siap sebagai ${client.user.tag}`);
});

// ==============================
// LISTEN PESAN
// ==============================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const text = message.content;

  // hanya proses pesan yang ada Nama & WD
  if (!text.includes("Nama") || !text.includes("WD")) return;

  // ==============================
  // PARSE FORMAT DISCORD
  // ==============================
  const namaMatch = text.match(/Nama\s*:\s*(.+)/i);
  const wdMatch   = text.match(/WD\s*:\s*(\d+)/i);

  if (!namaMatch || !wdMatch) {
    return message.reply(
      "❌ Format salah\nGunakan:\n```\nNama : Dadang\nWD   : 50\n```"
    );
  }

  const payload = {
    nama: namaMatch[1].trim(),
    wd: Number(wdMatch[1])
  };

  console.log("📤 Kirim ke Apps Script:", payload);

  // ==============================
  // KIRIM KE APPS SCRIPT
  // ==============================
  try {
    const res = await fetch(process.env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    // ⬅️ FIX UTAMA ADA DI SINI (PAKAI JSON)
    const json = await res.json();
    console.log("📥 Response Apps Script:", json);

    if (json.status === "ok") {
      message.reply("✅ Data masuk ke spreadsheet");
    } else {
      message.reply("❌ Apps Script error");
    }

  } catch (err) {
    console.error("🔥 ERROR:", err);
    message.reply("❌ Bot gagal konek ke spreadsheet");
  }
});

// ==============================
// LOGIN
// ==============================
client.login(process.env.DISCORD_TOKEN);
