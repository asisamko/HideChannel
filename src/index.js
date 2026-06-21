// src/index.js
// source code - https://gitea.oryks.org/sejmix/discord-channel-hider
// feel free to modify and redistribute, but keep the credits
// made by sejmix - v1.3-stable

const { Client, Events, GatewayIntentBits, ActivityType, PresenceUpdateStatus, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const fs = require('fs');
const { format } = require('date-fns');
require("dotenv").config({quiet: true});
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] }); // create new discord client instance

// Get custom role ID from environment variables
const CUSTOM_ROLE = '';

const colorsPath = require('path').join(__dirname, '../assets/terminal-colors.json'); // get path to terminal-colors.json
const activitiesPath = require('path').join(__dirname, '../assets/activities.json'); // get path to activities.json
const colors = require(colorsPath);
const activities_list = require(activitiesPath);

// get random activity from activities.json
const ACTIVITIES = activities_list.activities;
const getRandomActivity = () => {
    return ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
};

// update bot activity
const updateActivity = () => {
    const randomActivity = getRandomActivity();
    client.user.setPresence({
        activities: [{ 
            name: `${randomActivity}`,
            type: ActivityType.Custom,
        }],
        status: PresenceUpdateStatus.Idle,
    });
};

// create deafult embed msg template
const createEmbed = (title, description = null, color = '#2b2d31') => {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: 'Channel Hider Bot' });
    
    if (description) {
        embed.setDescription(description);
    }
    
    return embed;
};


// function to update config.json
const configPath = require('path').join(__dirname, './config.json');
const updateConfig = (guildId, channelIds, userId, guild_name, user_name) => {
    try {
        // Read existing config
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Initialize servers object if it doesn't exist
        if (!config.servers) {
            config.servers = {};
        }

        // Convert channel objects to IDs if necessary
        const channelIdArray = Array.isArray(channelIds) ? 
            channelIds.map(ch => typeof ch === 'string' ? ch : ch.id) : 
            [typeof channelIds === 'string' ? channelIds : channelIds.id];

        config.servers[guildId] = {
            "guildId": guildId,
            "guildName": guild_name,
            "channelIds": channelIdArray,
            "userId": userId,
            "userName": user_name,
            "lastUpdated": new Date().toISOString()
        };

        // save the updated config
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        return true;
    } catch (error) {
        console.error('Error updating config:', error);
        return false;
    }
};

// function to get server config from config.json
const getServerConfig = (guildId) => {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config.servers[guildId] || null;
    } catch (error) {
        console.error('Error reading config:', error);
        return null;
    }
};



// client on ready event
client.once(Events.ClientReady, readyClient => {
  let now = new Date();
  let formattedDate = format(now, 'yyyy-MM-dd HH:mm:ss');
    console.log(`[${colors.FgMagenta + "STARTING UP v1.2.1" + colors.Reset}]`)
	console.log(`[${colors.FgMagenta + formattedDate + colors.Reset}] ${colors.FgGreen}[+]${colors.Reset} Bot successfuly logged in as: '${readyClient.user.tag}' (${readyClient.user.id})\n`);
    updateActivity();
    setInterval(updateActivity, 2 * 60 * 1000);
});

// client on interactionCreate event - handles slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // ping command
    if (interaction.commandName === 'ping') {
        const sent = await interaction.reply({ 
            embeds: [createEmbed('🏓 Pinging...', 'Calculating latency...')],
            fetchReply: true, 
            ephemeral: true 
        });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply({ 
            embeds: [createEmbed('🏓 Pong!', `Bot Latency: \`${latency}ms\``, '#5865F2')]
        });
    }

    // help command
    if (interaction.commandName === 'help') {
        const helpEmbed = createEmbed(
            '📍 Available Commands',
            '`/set-channel [channel]` - Set which channel to hide/unhide\n' +
            '`/hide-channel` - Hides the channel from everyone\n' +
            '`/unhide-channel` - Unhides the channel from everyone\n' +
            '`/show-config` - Show the current configuration\n' +
            '`/ping` - Check latency\n' +
            '`/help` - Check available commands\n\n' +
            'Made by sejmix\nStill in development.',
            '#5865F2'
        );

        const btn_repo = new ButtonBuilder()
            .setLabel('View Repository 📂')
            .setURL('https://gitea.oryks.org/sejmix/discord-channel-manager') 
            .setStyle(ButtonStyle.Link); 

        const btn_instagram = new ButtonBuilder()
            .setLabel('My Instagram 👀')
            .setURL('https://instagram.com/fancysamkooo') 
            .setStyle(ButtonStyle.Link); 

        const row = new ActionRowBuilder().addComponents(btn_repo, btn_instagram);

        await interaction.reply({ embeds: [helpEmbed], components: [row], ephemeral: true });
    }

    // hide-channel command
    if (interaction.commandName === 'hide-channel') {
        try {
            const serverConfig = getServerConfig(interaction.guild.id);
            if (!serverConfig || !serverConfig.channelIds || serverConfig.channelIds.length === 0) {
                return interaction.reply({ 
                    embeds: [createEmbed('Error', 'No channel configured. Use `/set-channel` first.', '#ff0000')],
                    ephemeral: true 
                });
            }
            
            // Fetch all configured channels
            const channels = [];
            for (const channelId of serverConfig.channelIds) {
                const channel = await interaction.guild.channels.fetch(channelId);
                if (channel) channels.push(channel);
            }
            
            if (channels.length === 0) {
                return interaction.reply({ // if channel not found, return error msg
                    embeds: [createEmbed('Error', 'Configured channels not found.', '#ff0000')],
                    ephemeral: true 
                });
            }

            // Fetch the custom role
            const role = await interaction.guild.roles.fetch(CUSTOM_ROLE);
            if (!role) {
                return interaction.reply({
                    embeds: [createEmbed('Error', 'Role not found.', '#ff0000')],
                    ephemeral: true
                });
            }

            // hide the channels by denying ViewChannel permission
            for (const channel of channels) {
                await channel.permissionOverwrites.edit(role, {
                    ViewChannel: false,
                });
            }
            
            const channelNames = channels.map(ch => `**<#${ch.id}>** (\`${ch.id}\`)`).join('\n');
            await interaction.reply({
                embeds: [createEmbed('🔒 Channels Hidden', `${channelNames}\n\nare now **hidden** from the <@&${CUSTOM_ROLE}>.`, '#ff9900')],
                ephemeral: true
            });
            let now = new Date();
            let formattedDate = format(now, 'yyyy-MM-dd HH:mm:ss');
            const names = channels.map(ch => ch.name).join(', ');
            console.log(`[${colors.FgMagenta + formattedDate + colors.Reset}] Channels "${colors.FgYellow + names + colors.Reset}" hidden by ${colors.FgYellow + interaction.user.tag + colors.Reset} (${interaction.user.id})`);
            
        } catch (err) {
            console.error(err);
            if (interaction.replied) {
                await interaction.editReply({
                    embeds: [createEmbed('Error', 'Error while hiding the channel.', '#ff0000')],
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    embeds: [createEmbed('Error', 'Error while hiding the channel.', '#ff0000')],
                    ephemeral: true
                });
            }
        }
    }

    // unhide-channel command
    if (interaction.commandName === 'unhide-channel') {
        try {
            const serverConfig = getServerConfig(interaction.guild.id);
            if (!serverConfig || !serverConfig.channelIds || serverConfig.channelIds.length === 0) {
                return interaction.reply({ 
                    embeds: [createEmbed('Error', 'No channel configured. Use `/set-channel` first.', '#ff0000')],
                    ephemeral: true 
                });
            }
            
            // Fetch all configured channels
            const channels = [];
            for (const channelId of serverConfig.channelIds) {
                const channel = await interaction.guild.channels.fetch(channelId);
                if (channel) channels.push(channel);
            }
            
            if (channels.length === 0) {
                return interaction.reply({
                    embeds: [createEmbed('Error', 'Configured channels not found.', '#ff0000')],
                    ephemeral: true
                });
            }

            // Fetch the custom role
            const role = await interaction.guild.roles.fetch(CUSTOM_ROLE);
            if (!role) {
                return interaction.reply({
                    embeds: [createEmbed('Error', 'Role not found.', '#ff0000')],
                    ephemeral: true
                });
            }

            // unhide the channels by allowing ViewChannel permission
            for (const channel of channels) {
                await channel.permissionOverwrites.edit(role, {
                    ViewChannel: true,
                });
            }
            
            //

            const channelNames = channels.map(ch => `**<#${ch.id}>** (\`${ch.id}\`)`).join('\n');
            await interaction.reply({
                embeds: [createEmbed('🔓 Channels Unhidden', `${channelNames}\n\nare now **visible** to the <@&${CUSTOM_ROLE}>.`, '#00ff00')],
                ephemeral: true
            });
            let now = new Date();
            let formattedDate = format(now, 'yyyy-MM-dd HH:mm:ss');
            const names = channels.map(ch => ch.name).join(', ');
            console.log(`[${colors.FgMagenta + formattedDate + colors.Reset}] Channels "${colors.FgYellow + names + colors.Reset}" unhidden by ${colors.FgYellow + interaction.user.tag + colors.Reset} (${interaction.user.id})`);
            
        } catch (err) {
            console.error(err);
            if (interaction.replied) {
                await interaction.editReply({
                    embeds: [createEmbed('Error', 'Error while showing the channel.', '#ff0000')],
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    embeds: [createEmbed('Error', 'Error while showing the channel.', '#ff0000')],
                    ephemeral: true
                });
            }
        }
    }
    
    // §channel command
    if (interaction.commandName === 'set-channel') {
        const channels = [];
        
        // Get all provided channels
        for (let i = 1; i <= 5; i++) {
            const channel = interaction.options.getChannel(`channel${i}`);
            if (channel) {
                channels.push(channel);
            }
        }
        
        if (channels.length === 0) {
            return interaction.reply({
                embeds: [createEmbed('❌ Error', 'At least one channel is required.', '#ff0000')],
                ephemeral: true
            });
        }
        
        // Store channels in config
        const configUpdated = updateConfig(interaction.guild.id, channels, interaction.user.id, interaction.guild.name, interaction.user.tag);
        if (!configUpdated) {
            return interaction.reply({
                embeds: [createEmbed('Error', 'Failed to save configuration.', '#ff0000')],
                ephemeral: true
            });
        }

        // Create list of all channels
        const channelList = channels.map(ch => `**${ch.name}** (\`${ch.id}\`)`).join('\n');

        await interaction.reply({
            embeds: [createEmbed('✅ Channels set')
                .addFields(
                    { name: 'Channels', value: channelList, inline: false },
                    { name: 'Server', value: `**${interaction.guild.name}** (\`${interaction.guild.id}\`)`, inline: false },
                    { name: 'Config by', value: `**${interaction.user.tag}** (\`${interaction.user.id}\`)`, inline: false },
                )
                .setColor('#5865F2')],
            ephemeral: true
        });
        let now = new Date();
        let formattedDate = format(now, 'yyyy-MM-dd HH:mm:ss');
        const channelNames = channels.map(ch => ch.name).join(', ');
        console.log(`[${colors.FgMagenta + formattedDate + colors.Reset}] Target channels set to "${colors.FgYellow + channelNames + colors.Reset}" by ${colors.FgYellow + interaction.user.tag + colors.Reset} (${interaction.user.id})`);
    }

    // show-config command
    if (interaction.commandName === 'show-config') {
        const serverConfig = getServerConfig(interaction.guild.id);
        if (!serverConfig || !serverConfig.channelIds || serverConfig.channelIds.length === 0) {
            return interaction.reply({
                embeds: [createEmbed('ℹ️ Current Config', 'No channel configured. Use `/set-channel` first.', '#5865F2')],
                ephemeral: true
            });
        }
        
        // Fetch all configured channels
        const channels = [];
        for (const channelId of serverConfig.channelIds) {
            const channel = await interaction.guild.channels.fetch(channelId);
            if (channel) channels.push(channel);
        }
        
        if (channels.length === 0) {
            return interaction.reply({
                embeds: [createEmbed('ℹ️ Current Configuration', 'Configured channels not found.', '#5865F2')],
                ephemeral: true
            });
        }

        const channelNames = channels.map(ch => `**<#${ch.id}>** (\`${ch.id}\`)`).join('\n');
        
        await interaction.reply({
            embeds: [createEmbed('Current Configuration')
                .addFields(
                    { name: 'Channels', value: channelList, inline: false },
                    { name: 'Server', value: `**${serverConfig.guildName}** (\`${serverConfig.guildId}\`)`, inline: false },
                    { name: 'Set by', value: `**${serverConfig.userName}** (\`${serverConfig.userId}\`)`, inline: false },
                    { name: 'Last Updated', value: `<t:${Math.floor(new Date(serverConfig.lastUpdated).getTime() / 1000)}:R>`, inline: false }
                )
                .setColor('#5865F2')],
            ephemeral: true
        });
    }

    // channel-status command
    if (interaction.commandName === 'channel-status') {
        interaction.reply({content: '💔 Command currenly **not working** and causing server **craches**.', ephemeral: true})
        /*
        const serverConfig = getServerConfig(interaction.guild.id);
        if (!serverConfig) {
            return interaction.reply({
                embeds: [createEmbed('ℹ️ Channel Status', 'No channel configured. Use `/set-channel` first.', '#ff0000')],
                ephemeral: true
            });
        }
        const channel = await interaction.guild.channels.fetch(serverConfig.channelId);
        if (!channel) {
            return interaction.reply({
                embeds: [createEmbed('ℹ️ Channel Status', 'Configured channel not found.', '#ff0000')],
                ephemeral: true
            });
        }

        const role = await interaction.guild.roles.fetch(CUSTOM_ROLE);
        if (!role) {
            return interaction.reply({
                embeds: [createEmbed('Error', 'Role not found.', '#ff0000')],
                ephemeral: true
            });
        }

        const permissions = channel.permissionsFor(role);
        const canView = permissions.has('ViewChannel');

        const statusEmbed = createEmbed(
            '📊 Channel Status',
            `Channel **${channel.name}** is currently **${canView ? 'visible' : 'hidden'}** to **${role}**.`,
            canView ? '#5865F2' : '#ff0000'
        );

        await interaction.reply({
            embeds: [statusEmbed],
            ephemeral: true
        });
        */
    }
});

client.login(process.env.TOKEN)



// hide/unhide the channel by allowing ViewChannel permission from EVERYONE

//await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
//    ViewChannel: true,
//});