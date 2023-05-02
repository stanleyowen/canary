const { SlashCommandBuilder, codeBlock } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription(
      "Pong! Provides the websocket heartbeat and roundtrip latency of Canary."
    ),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: codeBlock(
        `Pong!\nWebsocket heartbeat: ${interaction.client.ws.ping}ms\nRoundtrip latency: Calculating...`
      ),
      fetchReply: true,
    });

    // Edit the reply to include the roundtrip latency
    interaction.editReply(
      codeBlock(
        `Pong!\nWebsocket heartbeat: ${
          interaction.client.ws.ping
        }ms\nRoundtrip latency: ${
          sent.createdTimestamp - interaction.createdTimestamp
        }ms`
      )
    );
  },
};
