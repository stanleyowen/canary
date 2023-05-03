const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription(
      "🏓 Pong! Provides the websocket heartbeat and roundtrip latency of Canary."
    ),
  async execute(interaction) {
    async function createEmbed(latency) {
      return new EmbedBuilder()
        .setColor(0x87ceeb)
        .setTitle("🏓 Pong")
        .addFields(
          {
            name: "Websocket heartbeat",
            value: `${interaction.client.ws.ping}ms`,
          },
          {
            name: "Roundtrip Latency",
            value: `${latency ?? "Calculating... "}ms`,
          }
        );
    }

    const sent = await interaction.reply({
      embeds: [await createEmbed()],
      fetchReply: true,
    });

    // Edit the reply to include the roundtrip latency
    await interaction.editReply({
      embeds: [
        await createEmbed(sent.createdTimestamp - interaction.createdTimestamp),
      ],
    });
  },
};
