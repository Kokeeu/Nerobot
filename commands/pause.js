const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { ok, err } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Pausa o reanuda la canción actual'),
  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [err('No hay música sonando.')], ephemeral: true });
    queue.node.setPaused(!queue.node.isPaused());
    const paused = queue.node.isPaused();
    return interaction.reply({
      embeds: [ok(paused ? '⏸️ Pausado' : '▶️ Reanudado', queue.currentTrack?.cleanTitle ?? '')],
    });
  },
};
