const { SlashCommandBuilder } = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');
const { ok, err } = require('../utils/theme');

const LOOP_LABEL = {
  [QueueRepeatMode.OFF]: 'OFF',
  [QueueRepeatMode.TRACK]: 'Tema',
  [QueueRepeatMode.QUEUE]: 'Cola',
  [QueueRepeatMode.AUTOPLAY]: 'Autoplay',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Cambia el modo loop')
    .addStringOption((o) =>
      o.setName('modo')
        .setDescription('off, track, queue o autoplay')
        .setRequired(true)
        .addChoices(
          { name: 'off', value: 'off' },
          { name: 'track', value: 'track' },
          { name: 'queue', value: 'queue' },
          { name: 'autoplay', value: 'autoplay' }
        )
    ),
  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [err('No hay música sonando.')], ephemeral: true });
    const modo = interaction.options.getString('modo', true);
    const map = { off: QueueRepeatMode.OFF, track: QueueRepeatMode.TRACK, queue: QueueRepeatMode.QUEUE, autoplay: QueueRepeatMode.AUTOPLAY };
    queue.setRepeatMode(map[modo]);
    return interaction.reply({ embeds: [ok('🔁 Loop', `Modo: **${LOOP_LABEL[map[modo]]}**`)] });
  },
};
