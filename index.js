const { Client, GatewayIntentBits, Events } = require("discord.js");
const { deployCommands, handleCommand } = require("./deploy-commands");
const config = require("./config");
const { runLlm, handleModalSubmit } = require("./logic");
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
  await deployCommands({ guildId: guild.id });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.channel != null) {
    runLlm(message).catch(console.error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    try {
      await handleCommand(interaction);
    } catch (error) {
      console.error('Command error:', error);
    }
  }

  if (interaction.isModalSubmit()) {
    try {
      handleModalSubmit(interaction);
    } catch (error) {
      console.error('Modal submit error:', error);
    }
  }
});
client.login(config.DISCORD_TOKEN);
