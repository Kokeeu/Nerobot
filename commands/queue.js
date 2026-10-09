const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { queueEmbed, err } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('Muestra la cola actual'),
  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [err('No hay música sonando.')], ephemeral: true });
    return interaction.reply({ embeds: [queueEmbed(queue)] });
  },
};
