const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { ok, err } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Detiene la música y limpia la cola'),
  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [err('No hay música sonando.')], ephemeral: true });
    queue.delete();
    return interaction.reply({ embeds: [ok('⏹️ Detenido', 'Música detenida y cola limpiada.')] });
  },
};
