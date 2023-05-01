const fs = require("node:fs");
const path = require("node:path");
const { SlashCommandBuilder, codeBlock } = require("discord.js");

// Collect all the SlashCommandBuilders from the command files
const commands = [];
const foldersPath = path.join(__dirname, "..");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the folder
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js") && file !== "help.js");

  // Grab all the SlashCommandBuilders from the command files
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Sort the commands alphabetically by name and filter out when the command is not available in DMs
commands
  .sort((a, b) => a.name.localeCompare(b.name))
  .filter((command) => command.defaultPermission !== false);

// Combine the name and description of each command into a single string
// Format: **/command** - description
const commandsString = commands
  .map((command) => `**/${command.name}** - ${command.description}`)
  .join("\n");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Provides a list of all the commands available to you."),
  async execute(interaction) {
    await interaction.reply({
      content: codeBlock(commandsString),
    });
  },
};
