const { Client, GatewayIntentBits, Events } = require("discord.js");
const { deployCommands, handleCommand } = require("./deploy-commands");
const { handleButton } = require("./deploy-buttons");
const { handleModal } = require("./deploy-modals");
const config = require("./config");
const { runLlm } = require("./logic");
const { dbRegister } = require("./db");

// Tables
dbRegister("prompts");

const client = new Client({
  intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, () => {
  console.log("Discord bot is ready! 🤖");
});

client.on(Events.GuildAvailable, async (guild) => {
  dbRegister(["instructions", guild.id]);
  await deployCommands({ guildId: guild.id });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.channel != null) {
    runLlm(message).catch(console.error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    await handleCommand(interaction);
  }

  if (interaction.isButton()) {
    await handleButton(interaction);
  }
  
  if (interaction.isModalSubmit()) {
    await handleModal(interaction);
  }
});
client.login(config.DISCORD_TOKEN);
