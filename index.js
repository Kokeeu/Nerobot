require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors, SpotifyExtractor } = require('@discord-player/extractor');
const { YoutubeExtractor } = require('discord-player-youtubei');
const { nowPlayingEmbed, ok, err } = require('./utils/theme');
const { controlRow } = require('./utils/controls');
const { handleControlButton } = require('./handlers/controls');

// FFmpeg (ffmpeg-static evita instalarlo manual en Windows)
try {
  process.env.FFMPEG_PATH = require('ffmpeg-static');
} catch {}

const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Player + extractors (YouTube / Spotify / Apple)
// Spotify solo da metadata: el audio llega por bridge a YouTube Music.
// SoundCloud está desactivado a petición (solo devolvía remixes).
const player = new Player(client);
(async () => {
  await player.extractors.loadMulti(DefaultExtractors);
  // OJO: unregister solo funciona con el string del identificador, no con la clase.
  await player.extractors.unregister('com.discord-player.soundcloudextractor').catch(() => {});
  console.log('SoundCloud desactivado');
  const sid = process.env.SPOTIFY_CLIENT_ID;
  const ssecret = process.env.SPOTIFY_CLIENT_SECRET;
  const hasCreds = sid && ssecret && !sid.includes('pega_aqui') && !ssecret.includes('pega_aqui');
  if (hasCreds) {
    await player.extractors.unregister('com.discord-player.spotifyextractor').catch(() => {});
    await player.extractors.register(SpotifyExtractor, { clientId: sid, clientSecret: ssecret });
    console.log('Spotify con credenciales OK');
  } else {
    console.log('Spotify sin credenciales (modo anónimo: puede sonar otro tema parecido)');
  }
  const ytCookie = process.env.YT_COOKIE;
  const hasCookie = ytCookie && !ytCookie.includes('pega_aqui');
  await player.extractors.register(YoutubeExtractor, {
    ...(hasCookie ? { cookie: ytCookie } : {}),
    overrideBridgeMode: 'ytmusic',
    streamOptions: { useClient: 'WEB_EMBEDDED' },
  });
  console.log('YouTube (youtubei) OK' + (hasCookie ? ' con cookies' : ' sin cookies'));
  console.log('Extractors cargados');
})().catch(console.error);

// Eventos de reproducción
player.events.on('playerStart', (queue, track) => {
  console.log(`Now playing: [${track.source}/${track.queryType}] ${track.author} - ${track.cleanTitle} | ${track.url ?? ''}`);
  if (track.bridgedTrack) console.log(`Bridge desde: ${track.bridgedTrack.url ?? track.bridgedTrack.title ?? ''}`);
  queue.metadata.channel
    .send({
      embeds: [nowPlayingEmbed(track)],
      components: [controlRow({ paused: false, shuffling: queue.isShuffling ?? false })],
    })
    .catch(() => {});
});

player.events.on('audioTrackAdd', (queue, track) => {
  queue.metadata.channel
    .send({ embeds: [ok('➕ Encolada', `**${track.cleanTitle}** — ${track.author} \`${track.duration}\``)] })
    .catch(() => {});
});

player.events.on('emptyQueue', (queue) => {
  queue.metadata.channel.send({ embeds: [ok('Cola terminada', 'Salgo del canal. ¡Gracias por escuchar!')] }).catch(() => {});
});

player.events.on('error', (queue, error) => {
  console.error('Error player:', error);
  queue.metadata.channel
    .send({ embeds: [err('Error de reproducción en YouTube. Prueba con otro tema o link de YouTube/Spotify.')] })
    .catch(() => {});
});

player.events.on('playerError', (queue, error) => {
  console.error('Error stream:', error);
});

// Cargar comandos slash
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd?.data?.name) client.commands.set(cmd.data.name, cmd);
  }
}

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() && interaction.customId.startsWith('nero:')) {
    try {
      await player.context.provide({ guild: interaction.guild }, () => handleControlButton(interaction));
    } catch (error) {
      console.error(error);
    }
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await player.context.provide({ guild: interaction.guild }, () => command.execute(interaction));
  } catch (error) {
    console.error(error);
    const msg = { content: 'Hubo un error ejecutando el comando.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(msg).catch(() => {});
    else await interaction.reply(msg).catch(() => {});
  }
});

client.once('ready', () => {
  console.log(`NeroMusic online como ${client.user.tag}`);
});

if (!TOKEN) {
  console.error('Falta TOKEN en .env (copia .env.example a .env y rellénalo)');
  process.exit(1);
}
client.login(TOKEN);
