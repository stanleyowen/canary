const { SlashCommandBuilder } = require("discord.js");
const { useMasterPlayer } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays music in a voice channel.")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Title of the song to play.")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    // Get the player instance that is created earlier
    const player = useMasterPlayer();
    const channel = interaction.member?.voice?.channel;

    if (!channel) {
      return await interaction.reply({
        content: "You are not in a voice channel!",
      });
    }

    // Check whether the user is in the same voice channel as the bot
    if (
      interaction.guild.members.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.members.me.voice.channelId
    ) {
      return await interaction.reply({
        content: "You are not in the same voice channel as the bot.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const query = interaction.options.getString("song", true);
    const searchResult = await player.search(query, {
      requestedBy: interaction.user,
    });

    if (!searchResult.hasTracks())
      return await interaction.followUp(`No results were found for ${query}!`);

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
        leaveOnEnd: true,
        leaveOnEndCooldown: 10000,
        leaveonEmpty: true,
        leaveonEmptyCooldown: 10000,
      });

      await interaction.editReply(`Loading your track...`);
    } catch (error) {
      return interaction.followUp(`Something wen wrong: ${error}`);
    }
  },
};
