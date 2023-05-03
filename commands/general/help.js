const fs = require("node:fs");
const path = require("node:path");
const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

const commands = {};
const foldersPath = path.join(__dirname, "..");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the folder
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js") && !file.startsWith("help"));

  // Grab all the SlashCommandBuilders from the command files
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      // Create a new array for each folder with the property of the category
      // Format: "category" : [SlashCommandBuilder, SlashCommandBuilder, ...]
      commands[folder] = commands[folder] || [];
      commands[folder].push(command.data.toJSON());
    } else
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
  }
}

// Create the embed inside the function so it can be updated later
async function createEmbed(key) {
  return {
    color: 0x87ceeb,
    // add emoji to title with id of 1102992711566495896
    title: "📝 Canary Commands",
    description: "Here are all the commands you can use to get started! 🚀",
    // Get the inner array of the specific category and map through each command
    // Append the category name to the first field
    fields: [
      {
        name: "\u200b",
        value: `**${
          // get the category name from the key and capitalize the first letter
          commandFolders[key].charAt(0).toUpperCase() +
          commandFolders[key].slice(1)
        } Commands**`,
      },
      ...Object.values(commands)[key].map((command) => {
        return {
          name: `**/${command.name}**`,
          value: command.description,
        };
      }),
    ],
    footer: {
      // Format: "Page 1 of 3"
      text: `Page ${key + 1} of ${Object.values(commands).length}`,
    },
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "🤔 Learn more about the commands to get started with Canary!"
    ),
  async execute(interaction) {
    // Create a key to keep track of the page number
    // Make a unique key for each interaction
    let key = 0;

    // Create buttons to navigate through the pages
    const previousButton = new ButtonBuilder()
      .setCustomId("previous")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);
    const firstButton = new ButtonBuilder()
      .setCustomId("first")
      .setLabel("First")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);
    const nextButton = new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary);
    const lastButton = new ButtonBuilder()
      .setCustomId("last")
      .setLabel("Last")
      .setStyle(ButtonStyle.Primary);

    // Add the buttons to the message
    const row = new ActionRowBuilder().addComponents(
      firstButton,
      previousButton,
      nextButton,
      lastButton
    );

    // Send the message with the buttons
    const response = await interaction.reply({
      embeds: [await createEmbed(0)],
      components: [row],
    });

    const collector = response.createMessageComponentCollector({
      // Set the limit up to 30 seconds
      time: 30000,
    });

    // Listen for button clicks
    collector.on("collect", async (i) => {
      // Make sure the user who used the command is the one who can interact with the buttons
      if (i.user.id !== interaction.user.id)
        return await i.reply({
          content: "❌ This is not your command!",
          ephemeral: true,
        });

      i.customId === "previous"
        ? key--
        : i.customId === "next"
        ? key++
        : i.customId === "first"
        ? (key = 0)
        : (key = Object.values(commands).length - 1);

      firstButton.setDisabled(key === 0 ? true : false);
      previousButton.setDisabled(key === 0 ? true : false);
      nextButton.setDisabled(
        key === Object.values(commands).length - 1 ? true : false
      );
      lastButton.setDisabled(
        key === Object.values(commands).length - 1 ? true : false
      );

      i.update({
        embeds: [await createEmbed(key)],
        components: [row],
      });
    });

    collector.on("end", async () => {
      // If the collector ended because of the time limit, disable the buttons
      firstButton.setDisabled(true);
      previousButton.setDisabled(true);
      nextButton.setDisabled(true);
      lastButton.setDisabled(true);

      await interaction.editReply({
        embeds: [await createEmbed(key)],
        components: [row],
      });
    });
  },
};
