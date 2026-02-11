require("dotenv").config();
const fetch = require("node-fetch"); // WAJIB v2
const { Client, GatewayIntentBits, Partials } = require("discord.js");

// ==============================
// INIT CLIENT
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ==============================
// READY
// ==============================
client.once("clientReady", () => {
  console.log(`🤖 Bot aktif sebagai ${client.user.tag}`);
});

// ==============================
// HANDLE MESSAGE INPUT
// ==============================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const text = message.content;

  // minimal ada Nama + WD/DP
  if (!text.includes("Nama") || (!text.includes("WD") && !text.includes("DP"))) return;

  const namaMatch = text.match(/Nama\s*:\s*(.+)/i);
  const jenisMatch = text.match(/\b(WD|DP)\b\s*:\s*(\d+)/i);

  if (!namaMatch || !jenisMatch) {
    return message.reply(
      "❌ Format salah!\nGunakan:\n```\nNama : Angel\nWD   : 50\nSisa : 0 P3K\n```"
    );
  }

  const payload = {
    nama: namaMatch[1].trim(),
    jenis: jenisMatch[1].toUpperCase(),
    qty: Number(jenisMatch[2]),
    messageId: message.id
  };

  try {
    const res = await fetch(process.env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (json.status === "inserted") {
      await message.react("📄");
    }

  } catch (err) {
    console.error("🔥 ERROR kirim ke Apps Script:", err);
    message.reply("❌ Bot gagal konek ke Spreadsheet");
  }
});

// ==============================
// HANDLE REACTION 💸
// ==============================
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      console.error("Gagal fetch reaction:", err);
      return;
    }
  }

  if (reaction.emoji.name !== "💸") return;

  try {
    await fetch(process.env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "paid",
        messageId: reaction.message.id
      })
    });
  } catch (err) {
    console.error("🔥 ERROR update PAID:", err);
  }
});

// ==============================
client.login(process.env.DISCORD_TOKEN);