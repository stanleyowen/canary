const { SlashCommandBuilder } = require("discord.js");
const { useMasterPlayer } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("🎶 Stream high quality music in your voice channel.")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Title or URL of the song to play.")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    // Get the player instance that is created earlier
    const player = useMasterPlayer();
    const channel = interaction.member?.voice?.channel;

    if (!channel)
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

    // Defer the reply to avoid "This interaction failed" error
    await interaction.deferReply();

    const query = interaction.options.getString("song", true);
    const searchResult = await player.search(query, {
      requestedBy: interaction.user,
    });

    if (!searchResult.hasTracks())
      return await interaction.followUp(
        `❌ No results were found for ${query}!`
      );

    try {
      await player.play(channel, searchResult, {
        ytdlOptions: {
          quality: "highest",
          filter: "audioonly",
          highWaterMark: 1 << 30,
          dlChunkSize: 0,
        },
        nodeOptions: {
          metadata: interaction.channel,
        },
        leaveOnEndCooldown: 10000,
        leaveonEmptyCooldown: 10000,
      });

      await interaction.followUp(
        `🎶 Now playing **${searchResult.tracks[0].title}**!`
      );
    } catch (error) {
      return interaction.followUp(`❌ Something went wrong: ${error}`);
    }
  },
};
