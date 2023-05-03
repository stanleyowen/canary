const { SlashCommandBuilder } = require("discord.js");
const { useHistory } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("🎶 Loving your previous song? Go back to it ASA")
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.member?.voice?.channel)
      return await interaction.reply({
        content: "❌ You are not in a voice channel!",
      });

    if (
      interaction.guild.members.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.members.me.voice.channelId
    )
      return await interaction.reply({
        content: "❌ You are not in the same voice channel as Canary.",
        ephemeral: true,
      });

    const history = useHistory(interaction.guildId);
    if (history && history.previous.length > 1) {
      await history.previous();

      return await interaction.reply({
        content: "🎶 Music has been rewinded.",
      });
    } else
      return await interaction.reply({
        content: "❌ There are currently no songs in the history.",
      });
  },
};
