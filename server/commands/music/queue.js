const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("🎶 Shows the queue of the current playing song.")
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
      const tracks = queue.tracks.toArray();
      const { currentTrack } = queue;

      const embed = new EmbedBuilder()
        .setColor("#87CEEB")
        .setTitle("Queue")
        .setDescription(
          tracks && tracks.length
            ? tracks
                .map(
                  (track, index) =>
                    `${index + 1}. **${track.title}** - ${track.duration}`
                )
                .join("\n")
            : null
        )
        .setFooter({
          text: `🎶 Now playing: ${currentTrack.title} - ${currentTrack.duration}`,
        });
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎶 Queue List")
            .setDescription(
              "❌ There are currently no songs in the queue.\nTo add a song, use `/play`."
            )
            .setColor("#87CEEB"),
        ],
      });
    }
  },
};
