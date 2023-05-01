const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("🎧 Shows the queue of the current playing song.")
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.member?.voice?.channel) {
      return await interaction.reply({
        content: "You are not in a voice channel!",
        ephemeral: true,
      });
    }

    if (
      interaction.guild.members.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.members.me.voice.channelId
    ) {
      return await interaction.reply({
        content: "You are not in my voice channel!",
        ephemeral: true,
      });
    }

    const queue = useQueue(interaction.guildId);

    if (queue) {
      const tracks = queue.tracks.toArray();
      const { currentTrack } = queue;

      const embed = new EmbedBuilder()
        .setTitle("Queue")
        .setDescription(
          tracks
            .map(
              (track, index) =>
                `${index + 1}. **${track.title}** - ${track.duration}`
            )
            .join("\n")
        )
        .setFooter({
          text: `Now playing: ${currentTrack.title} - ${currentTrack.duration}`,
        })
        .setColor("#87CEEB");
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Queue")
            .setDescription("There are no songs in the queue.")
            .setColor("#87CEEB"),
        ],
      });
    }
  },
};
