const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { ok, err, queueEmbed } = require('../utils/theme');
const { controlRow, playlistRow } = require('../utils/controls');

function sameVoice(interaction) {
  const memberChannel = interaction.member?.voice?.channel;
  if (!memberChannel) return 'Únete a un canal de voz primero.';
  const botChannel = interaction.guild.members.me?.voice?.channel;
  if (botChannel && botChannel.id !== memberChannel.id) return 'Estoy en otro canal de voz.';
  return null;
}

function currentRow(interaction) {
  // Reconstruye la fila según el mensaje: si es de playlist usa playlistRow
  const ids = interaction.message?.components?.[0]?.components?.map((c) => c.customId) || [];
  return { isPlaylist: !ids.includes('nero:pause') };
}

async function refreshButtons(interaction, queue) {
  const { isPlaylist } = currentRow(interaction);
  const row = isPlaylist
    ? playlistRow({ shuffling: queue?.isShuffling ?? false })
    : controlRow({ paused: queue?.node?.isPaused() ?? false, shuffling: queue?.isShuffling ?? false });
  const embed = interaction.message?.embeds?.[0]
    ? EmbedBuilder.from(interaction.message.embeds[0])
    : null;
  await interaction.message.edit({ ...(embed ? { embeds: [embed] } : {}), components: [row] }).catch(() => {});
}

async function handleControlButton(interaction) {
  const errVoice = sameVoice(interaction);
  if (errVoice) return interaction.reply({ content: errVoice, ephemeral: true });

  const queue = useQueue(interaction.guild.id);
  const action = interaction.customId.replace('nero:', '');

  if (action === 'queue') {
    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [err('No hay música sonando.')], ephemeral: true });
    return interaction.reply({ embeds: [queueEmbed(queue)], ephemeral: true });
  }

  if (!queue || !queue.isPlaying()) {
    return interaction.reply({ embeds: [err('No hay música sonando.')], ephemeral: true });
  }

  await interaction.deferUpdate().catch(() => {});

  if (action === 'pause') {
    queue.node.setPaused(!queue.node.isPaused());
    await refreshButtons(interaction, queue);
    return interaction.followUp({
      embeds: [ok(queue.node.isPaused() ? '⏸️ Pausado' : '▶️ Reanudado', queue.currentTrack.cleanTitle)],
      ephemeral: true,
    }).catch(() => {});
  }
  if (action === 'skip') {
    const title = queue.currentTrack?.cleanTitle ?? 'tema actual';
    queue.node.skip();
    await refreshButtons(interaction, queue).catch(() => {});
    return interaction.followUp({ embeds: [ok('⏭️ Saltada', title)], ephemeral: true }).catch(() => {});
  }
  if (action === 'stop') {
    queue.delete();
    await interaction.message.edit({ components: [] }).catch(() => {});
    return interaction.followUp({ embeds: [ok('⏹️ Detenido', 'Música detenida y cola limpiada.')], ephemeral: true }).catch(() => {});
  }
  if (action === 'shuffle') {
    const on = queue.toggleShuffle();
    await refreshButtons(interaction, queue);
    return interaction.followUp({
      embeds: [ok(on ? '🔀 Aleatorio activado' : '🔀 Aleatorio desactivado', on ? 'Los siguientes temas saldrán en orden aleatorio.' : 'Vuelve el orden normal de la cola.')],
      ephemeral: true,
    }).catch(() => {});
  }
}

module.exports = { handleControlButton };
