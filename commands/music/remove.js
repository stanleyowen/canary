const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("🎶 Shuffle the music queue")
    .addStringOption((option) =>
      option
        .setName("track_number")
        .setDescription("Number of the track to remove from the queue")
        .setRequired(true)
    )
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
    const trackNumber = interaction.options.getString("track_number");
    if (queue && queue.tracks.length >= trackNumber) {
      await queue.removeTrack(trackNumber);

      return await interaction.reply({
        content: "🎶 Music was removed from the queue.",
      });
    } else
      return await interaction.reply({
        content: "❌ There are currently no songs in the queue.",
      });
  },
};
