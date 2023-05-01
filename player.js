module.exports = async (player) => {
  // This is to load the default extractors from the @discord-player/extractor package
  await player.extractors.loadDefault();

  player.on("connectionCreate", (queue) => {
    queue.connection.voiceConnection.on("stateChange", (oldState, newState) => {
      const oldNetworking = Reflect.get(oldState, "networking");
      const newNetworking = Reflect.get(newState, "networking");

      const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
        const newUdp = Reflect.get(newNetworkState, "udp");
        clearInterval(newUdp?.keepAliveInterval);
      };

      oldNetworking?.off("stateChange", networkStateChangeHandler);
      newNetworking?.on("stateChange", networkStateChangeHandler);
    });
  });

  player.events.on("playerStart", (queue, track) => {
    queue.metadata.send(`🎶 | Started playing: **${track.title}**!`);
  });

  player.on("error", (queue, error) => {
    console.log(
      `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
    );
  });

  player.on("connectionError", (queue, error) => {
    console.log(
      `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
    );
  });

  player.on("trackAdd", (queue, track) => {
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
  });

  player.on("botDisconnect", (queue) => {
    queue.metadata.send(
      "❌ | I was manually disconnected from the voice channel, clearing queue!"
    );
  });

  player.on("channelEmpty", (queue) => {
    queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
  });

  player.on("queueEnd", (queue) => {
    queue.metadata.send("✅ | Queue finished!");
  });
};
