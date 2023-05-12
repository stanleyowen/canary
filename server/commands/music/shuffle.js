const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("🎶 Shuffle the music queue")
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
    if (queue && queue.tracks.toArray().length > 1) {
      await queue.tracks.shuffle();

      return await interaction.reply({
        content: "🎶 Music queue has been shuffled.",
      });
    } else
      return await interaction.reply({
        content: "❌ There are currently no songs in the queue.",
      });
  },
};
