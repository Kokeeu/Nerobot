const { EmbedBuilder } = require('discord.js');

const BRAND_COLOR = 0x9b59b6;
const BRAND_NAME = 'NeroMusic';

const SOURCE_LABEL = {
  youtube: 'YouTube',
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  attachment: 'Archivo',
  vimeo: 'Vimeo',
  reverbnation: 'ReverbNation',
};

function sourceLabel(source) {
  return SOURCE_LABEL[source] || String(source || 'Música');
}

function base() {
  return new EmbedBuilder().setColor(BRAND_COLOR).setFooter({ text: BRAND_NAME });
}

// Embed principal de reproducción (now playing / playerStart)
function nowPlayingEmbed(track, { status = 'Reproduciendo ahora' } = {}) {
  const embed = base()
    .setAuthor({ name: `${status} · ${sourceLabel(track.source)}` })
    .setTitle(track.cleanTitle || track.title)
    .setDescription(`**${track.author}**`)
    .addFields({ name: 'Duración', value: track.duration || '??:??', inline: true })
    .setThumbnail(track.thumbnail || null)
    .setTimestamp();
  if (track.url) embed.setURL(track.url);
  const by = track.requestedBy?.tag;
  if (by) embed.setFooter({ text: `${BRAND_NAME} · Pedida por ${by}` });
  return embed;
}

// Confirmación compacta (play, skip, stop...)
function ok(title, desc) {
  const e = base().setTitle(title);
  if (desc) e.setDescription(desc);
  return e;
}

function err(desc) {
  return base().setTitle('Algo falló').setDescription(desc);
}

// Embed de cola (comando /queue y botón 📋)
function queueEmbed(queue, { max = 10 } = {}) {
  const current = queue.currentTrack;
  const tracks = queue.tracks.toArray();
  let desc = `**Sonando:** [${current.cleanTitle}](${current.url || '#'}) — ${current.author}\n\n`;
  if (tracks.length) {
    desc += '**Siguientes:**\n';
    desc += tracks
      .slice(0, max)
      .map((t, i) => `\`${i + 1}.\` [${t.cleanTitle}](${t.url || '#'}) · \`${t.duration}\``)
      .join('\n');
    if (tracks.length > max) desc += `\n...y ${tracks.length - max} más`;
  } else {
    desc += 'Cola vacía después de esta.';
  }
  return base()
    .setAuthor({ name: `Cola de ${BRAND_NAME}` })
    .setDescription(desc)
    .setFooter({ text: `${BRAND_NAME} · ${tracks.length + 1} tema(s) · ${queue.durationFormatted || ''}`.trim() });
}

module.exports = { BRAND_COLOR, BRAND_NAME, sourceLabel, base, nowPlayingEmbed, queueEmbed, ok, err };
