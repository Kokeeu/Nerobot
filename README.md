# NeroMusic — bot de música Discord estilo Groovy

Bot de música con `discord.js` + `discord-player` + `discord-player-youtubei`.
Comandos slash: `/play /playlist /skip /stop /pause /queue /nowplaying /volume /loop`.

Fuentes: YouTube y Spotify (por bridge a YouTube). SoundCloud desactivado:
solo devolvía remixes.

## Requisitos

- Node.js 18+ (probado en 24)
- App en Discord Developer Portal con intents `Guilds`, `GuildVoiceStates`, `GuildMessages`, `MessageContent`
- Scopes de invitación: `bot` + `applications.commands`
- Permisos: Ver canales, Enviar mensajes, Insertar enlaces, Leer historial, Usar comandos de barra, Conectar, Hablar

## Instalación

```
npm install
```

Copia `.env.example` a `.env` y rellena:

```
TOKEN=...
CLIENT_ID=...
GUILD_ID=...            # solo pruebas (registro instantáneo)
SPOTIFY_CLIENT_ID=...   # developer.spotify.com/dashboard (metadata exacta)
SPOTIFY_CLIENT_SECRET=...
YT_COOKIE=...           # opcional, ver abajo
```

Registrar comandos y arrancar:

```
npm run dev     # deploy + start (pruebas)
npm start       # solo arrancar
```

## Cómo suena Spotify

Spotify solo da metadata; el audio llega por bridge a YouTube Music
(`YoutubeExtractor` con `overrideBridgeMode: 'ytmusic'`).
`/play` detecta links de track de Spotify y los reproduce vía
`ytsearch:autor - título` para que suene el original.
`/playlist` acepta playlists/álbumes de Spotify y playlists de YouTube;
las de Spotify tardan (cada tema se busca en YouTube) y conviene probar
primero con listas cortas.

## Botones

Cada tema que empieza trae fila de control: ⏸ Pausar/Reanudar · ⏭ Saltar ·
🔀 Aleatorio ON/OFF · 📋 Cola (efímera) · ⏹ Detener.
El embed de `/playlist` trae 🔀 Aleatorio + 📋 Ver cola + ⏭ Saltar.
Funcionan siempre (sin timeout) y piden estar en el mismo canal de voz que el bot.

## YT_COOKIE (solo si YouTube bloquea streams)

Si en consola sale `Sign in to confirm` al reproducir:

1. Usa una cuenta **secundaria** de Google, nunca tu principal. La cookie da acceso a tu cuenta.
2. Abre `youtube.com` logueado con esa cuenta.
3. `F12` → pestaña **Network** → recarga.
4. Clica una petición a `www.youtube.com` → **Headers** → **Request Headers** → **Cookie** → Copy value.
5. En `.env`, en una sola línea: `YT_COOKIE=VISITOR_INFO1_LIVE=...; YSC=...; ...`
6. Reinicia (`npm start`). Debe decir `YouTube (youtubei) OK con cookies`.

Las cookies caducan: si vuelve el error, repite el proceso.
Mientras suene sin error, deja el placeholder, no hace falta.

## Problemas comunes

- `Missing Access` en deploy → el bot no está en el servidor del `GUILD_ID`. Reinvita con `bot` + `applications.commands`.
- Suena otro tema con link de Spotify → con este setup ya va por `ytsearch` (YouTube). Si un tema concreto falla, usa su link directo de YouTube.
- `GUILD_ID` solo para pruebas. Quítalo del `.env` para registro global (tarda hasta 1h en aparecer).
