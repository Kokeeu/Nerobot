const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');
const { base, err } = require('../utils/theme');
const { playlistRow } = require('../utils/controls');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Reproduce una playlist o álbum completo')
    .addStringOption((o) =>
      o.setName('url').setDescription('Link de playlist de YouTube o Spotify').setRequired(true)
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

    const url = interaction.options.getString('url', true);
    await interaction.deferReply();
    try {
      const result = await player.play(channel, url, {
        requestedBy: interaction.user,
        nodeOptions: { metadata: { channel: interaction.channel } },
      });
      const queue = useQueue(interaction.guild.id);
      const total = queue ? queue.tracks.size + (queue.currentTrack ? 1 : 0) : 1;
      const upcoming = queue ? queue.tracks.toArray().slice(0, 5) : [];
      const plTitle =
        result?.searchResult?.playlist?.title ?? result?.playlist?.title ?? null;
      let desc = `📀 **${total} tema${total === 1 ? '' : 's'}** en cola · \`${queue?.durationFormatted || ''}\`\n`;
      desc += `▶️ Sonando: **${result.track.cleanTitle}** — ${result.track.author}\n`;
      if (upcoming.length) {
        desc += '\n**A continuación:**\n';
        desc += upcoming.map((t, i) => `\`${i + 1}.\` ${t.cleanTitle} · \`${t.duration}\``).join('\n');
      }
      const embed = base()
        .setAuthor({ name: plTitle ? `Playlist: ${plTitle}` : 'Playlist añadida' })
        .setDescription(desc)
        .setThumbnail(result.track.thumbnail || null);
      const by = interaction.user.tag;
      embed.setFooter({ text: `NeroMusic · Pedida por ${by}` });
      return interaction.followUp({
        embeds: [embed],
        components: [playlistRow({ shuffling: queue?.isShuffling ?? false })],
      });
    } catch (e) {
      console.error(e);
      return interaction.followUp({
        embeds: [err('No se pudo cargar la playlist. Usa un link de YouTube o Spotify (las de Spotify tardan: cada tema se busca en YouTube).')],
      });
    }
  },
};
