const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// IDs: nero:pause | nero:skip | nero:stop | nero:queue | nero:shuffle

function controlRow({ paused = false, shuffling = false } = {}) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('nero:pause')
      .setLabel(paused ? 'Reanudar' : 'Pausar')
      .setEmoji(paused ? '▶️' : '⏸️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('nero:skip')
      .setLabel('Saltar')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('nero:shuffle')
      .setLabel(`Aleatorio: ${shuffling ? 'ON' : 'OFF'}`)
      .setEmoji('🔀')
      .setStyle(shuffling ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('nero:queue')
      .setLabel('Cola')
      .setEmoji('📋')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('nero:stop')
      .setLabel('Detener')
      .setEmoji('⏹️')
      .setStyle(ButtonStyle.Danger)
  );
}

function playlistRow({ shuffling = false } = {}) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('nero:shuffle')
      .setLabel(`Aleatorio: ${shuffling ? 'ON' : 'OFF'}`)
      .setEmoji('🔀')
      .setStyle(shuffling ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('nero:queue')
      .setLabel('Ver cola')
      .setEmoji('📋')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('nero:skip')
      .setLabel('Saltar')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = { controlRow, playlistRow };
