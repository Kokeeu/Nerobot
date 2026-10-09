const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { ok, err } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ajusta el volumen (0-100)')
    .addIntegerOption((o) => o.setName('nivel').setDescription('0 a 100').setRequired(true).setMinValue(0).setMaxValue(100)),
  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [err('No hay música sonando.')], ephemeral: true });
    const nivel = interaction.options.getInteger('nivel', true);
    queue.node.setVolume(nivel);
    return interaction.reply({ embeds: [ok('🔊 Volumen', `Nivel: **${nivel}%**`)] });
  },
};
