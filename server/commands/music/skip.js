const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("🎶 Skip the current playing song")
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

    const queue = useQueue(interaction.guildId);

    if (queue) {
      await queue.node.skip();

      return await interaction.reply({
        content: "🎶 Skipped the current playing song.",
      });
    } else
      return await interaction.reply({
        content: "❌ There are currently no songs in the queue.",
      });
  },
};
