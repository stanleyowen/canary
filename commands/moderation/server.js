const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  // Set the permissions only for the server owner
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the server.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  // The permission type is a role,
  async execute(interaction) {
    // interaction.guild is the object representing the Guild in which the command was run
    await interaction.reply(
      `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
    );
  },
};
