require("dotenv").config();
const fetch = require("node-fetch");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once("ready", () => {
  console.log(`🤖 Bot aktif sebagai ${client.user.tag}`);
});

// ==========================
// INPUT WD / DP
// ==========================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const text = message.content;

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

    if (json.status === "ok") {
      await message.react("📄");
    }

  } catch (err) {
    console.error(err);
    message.reply("❌ Bot gagal konek ke Spreadsheet");
  }
});

// ==========================
// REACTION 💸 → PAID
// ==========================
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    await reaction.fetch();
  }

  if (reaction.emoji.name !== "💸") return;

  await fetch(process.env.APPS_SCRIPT_URL + "?action=paid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messageId: reaction.message.id
    })
  });
});

client.login(process.env.DISCORD_TOKEN);
