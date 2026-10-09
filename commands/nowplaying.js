const { SlashCommandBuilder } = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');
const { nowPlayingEmbed, err } = require('../utils/theme');
const { controlRow } = require('../utils/controls');

const LOOP_LABEL = {
  [QueueRepeatMode.OFF]: 'OFF',
  [QueueRepeatMode.TRACK]: 'Tema',
  [QueueRepeatMode.QUEUE]: 'Cola',
  [QueueRepeatMode.AUTOPLAY]: 'Autoplay',
};

module.exports = {
  data: new SlashCommandBuilder().setName('nowplaying').setDescription('Muestra la canción actual'),
  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [err('No hay música sonando.')], ephemeral: true });

    const t = queue.currentTrack;
    const bar = queue.node.createProgressBar();
    const embed = nowPlayingEmbed(t, { status: queue.node.isPaused() ? 'En pausa' : 'Sonando ahora' });
    const lines = [];
    if (bar) lines.push(bar);
    lines.push(
      `🔊 \`${queue.node.volume}%\` · 🔁 \`${LOOP_LABEL[queue.repeatMode] ?? queue.repeatMode}\` · 🔀 \`${queue.isShuffling ? 'ON' : 'OFF'}\``
    );
    embed.addFields({ name: 'Progreso', value: lines.join('\n'), inline: false });
    return interaction.reply({
      embeds: [embed],
      components: [controlRow({ paused: queue.node.isPaused(), shuffling: queue.isShuffling ?? false })],
    });
  },
};
