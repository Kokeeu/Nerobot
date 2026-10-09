const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { ok, err } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce una canción o la añade a la cola')
    .addStringOption((o) =>
      o.setName('query').setDescription('Nombre, link de YouTube o Spotify').setRequired(true)
    ),
  async execute(interaction) {
    const player = useMainPlayer();
    const channel = interaction.member?.voice?.channel;
    if (!channel) return interaction.reply({ content: 'Únete a un canal de voz primero.', ephemeral: true });

    const me = interaction.guild.members.me;
    if (me.voice.channel && me.voice.channel.id !== channel.id)
      return interaction.reply({ content: 'Ya estoy en otro canal de voz.', ephemeral: true });
    if (!channel.permissionsFor(me).has(PermissionsBitField.Flags.Connect))
      return interaction.reply({ content: 'No tengo permiso para conectarme.', ephemeral: true });
    if (!channel.permissionsFor(me).has(PermissionsBitField.Flags.Speak))
      return interaction.reply({ content: 'No tengo permiso para hablar.', ephemeral: true });

    const query = interaction.options.getString('query', true);
    await interaction.deferReply();
    try {
      // Spotify solo da metadata y el bridge va a YouTube Music (tema original).
      // Para tracks sueltos de Spotify resolvemos metadata y reproducimos
      // vía YouTube directamente.
      // SoundCloud está desactivado: los nombres sueltos van a YouTube
      // (ytsearch:) porque ningún otro extractor reclama texto libre.
      let playQuery = query;
      if (/open\.spotify\.com\/(intl-[^/]+\/)?track\//i.test(query)) {
        try {
          const spRes = await player.search(query, { requestedBy: interaction.user });
          const spTrack = spRes?.tracks?.[0];
          if (spTrack) {
            playQuery = `ytsearch:${spTrack.author} - ${spTrack.title}`;
            console.log(`Spotify->YouTube: "${spTrack.author} - ${spTrack.title}"`);
          }
        } catch (e) {
          console.error('Fallback Spotify search:', e?.message ?? e);
        }
      } else if (!/^https?:\/\//i.test(query) && !/^\w+:/.test(query)) {
        playQuery = `ytsearch:${query}`;
      }
      const { track } = await player.play(channel, playQuery, {
        requestedBy: interaction.user,
        nodeOptions: { metadata: { channel: interaction.channel } },
      });
      return interaction.followUp({ embeds: [ok('➕ Encolada', `**${track.cleanTitle}** — ${track.author} \`${track.duration}\``)] });
    } catch (e) {
      console.error(e);
      return interaction.followUp({ embeds: [err('No se pudo reproducir. Prueba con otro tema o link de YouTube/Spotify.')] });
    }
  },
};
