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

// Create buttons to navigate through the pages
const previousButton = new ButtonBuilder()
  .setCustomId("previous")
  .setLabel("Previous")
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(true);
const nextButton = new ButtonBuilder()
  .setCustomId("next")
  .setLabel("Next")
  .setStyle(ButtonStyle.Primary);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Learn more about the commands to get started with Canary!"
    ),
  async execute(interaction) {
    let key = 0;

    // Combine the name and description of each command into a single string
    // Format: **/command** - description
    async function createEmbed(key) {
      return {
        color: 0x87ceeb,
        title: "Commands",
        description: "Here is a list of all the commands available to you.",
        // Get the inner array of the specific category and map through each command
        fields: Object.values(commands)[key].map((command) => {
          return {
            name: `**/${command.name}**`,
            value: command.description,
          };
        }),
      };
    }

    // Add the buttons to the message
    const row = new ActionRowBuilder().addComponents(
      previousButton,
      nextButton
    );

    // Send the message with the buttons
    const response = await interaction.reply({
      embeds: [await createEmbed(key)],
      components: [row],
    });

    const collector = response.createMessageComponentCollector();

    collector.on("collect", async (i) => {
      // Make sure the user who used the command is the one who can interact with the buttons
      if (i.user.id !== interaction.user.id)
        return await i.reply({
          content: "You are not allowed to use this button!",
          ephemeral: true,
        });

      if (i.customId === "previous") {
        key--;
        if (key === 0) previousButton.setDisabled(true);
        nextButton.setDisabled(false);

        i.update({
          embeds: [await createEmbed(key)],
          components: [row],
        });
      } else if (i.customId === "next") {
        key++;
        if (key === Object.values(commands).length - 1)
          nextButton.setDisabled(true);
        previousButton.setDisabled(false);

        i.update({
          embeds: [await createEmbed(key)],
          components: [row],
        });
      }
    });
  },
};
