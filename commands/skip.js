const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { ok, err } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Salta la canción actual'),
  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [err('No hay música sonando.')], ephemeral: true });
    const title = queue.currentTrack?.cleanTitle ?? 'tema actual';
    queue.node.skip();
    return interaction.reply({ embeds: [ok('⏭️ Saltada', title)] });
  },
};
