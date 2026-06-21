// src/index.js
// source code - https://gitea.oryks.org/sejmix/discord-channel-hider
// feel free to modify and redistribute, but keep the credits
// made by sejmix - v1.2.1-stable

const { Client, Events, GatewayIntentBits, ActivityType, PresenceUpdateStatus, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const { format } = require('date-fns');
require("dotenv").config({quiet: true});
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] }); // create new discord client instance

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
const updateConfig = (guildId, channelId, userId, guild_name, user_name) => {
    try {
        // Read existing config
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Initialize servers object if it doesn't exist
        if (!config.servers) {
            config.servers = {};
        }

        config.servers[guildId] = {
            "guildId": guildId,
            "guildName": guild_name,
            "channelId": channelId,
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
            '`/channel-config - Checks if the target channel is hidden or visible`' +
            '`/show-config` - Show the current configuration\n\n' +
            '`/ping` - Check latency\n' +
            '`/help` - Check available commands\n\nMade by sejmix\nStill in development.',
            '#5865F2'
        );
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }

    // hide-channel command
    if (interaction.commandName === 'hide-channel') {
        try {
            const serverConfig = getServerConfig(interaction.guild.id);
            if (!serverConfig) {
                return interaction.reply({ 
                    embeds: [createEmbed('Error', 'No channel configured. Use `/set-channel` first.', '#ff0000')],
                    ephemeral: true 
                });
            }
            const channel = await interaction.guild.channels.fetch(serverConfig.channelId);
            if (!channel) return interaction.reply({ // if channel not found, return error msg
                embeds: [createEmbed('Error', 'Channel not found.', '#ff0000')],
                ephemeral: true 
            });

            // hide the channel by denying ViewChannel permission
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                ViewChannel: false,
            });

            await interaction.reply({
                embeds: [createEmbed('🔒 Channel Hidden', `Channel **${channel.name}** is now hidden from **${role}**.`, '#ff9900')],
                ephemeral: true
            });
            let now = new Date();
            let formattedDate = format(now, 'yyyy-MM-dd HH:mm:ss');
            console.log(`[${colors.FgMagenta + formattedDate + colors.Reset}] Channel "${colors.FgYellow + channel.name + colors.Reset}" hidden by ${colors.FgYellow + interaction.user.tag + colors.Reset} (${interaction.user.id})`);
            
        } catch (err) {
            console.error(err);
            interaction.reply({
                embeds: [createEmbed('Error', 'Error while hiding the channel.', '#ff0000')],
                ephemeral: true
            });
        }
    }

    // unhide-channel command
    if (interaction.commandName === 'unhide-channel') {
        try {
            const serverConfig = getServerConfig(interaction.guild.id);
            if (!serverConfig) {
                return interaction.reply({ 
                    embeds: [createEmbed('Error', 'No channel configured. Use `/set-channel` first.', '#ff0000')],
                    ephemeral: true 
                });
            }
            const channel = await interaction.guild.channels.fetch(serverConfig.channelId);
            if (!channel) return interaction.reply({
                embeds: [createEmbed('Error', 'Channel not found.', '#ff0000')],
                ephemeral: true
            });


            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
               ViewChannel: true,
            });

            await interaction.reply({
                embeds: [createEmbed('🔓 Channel Unhidden', `Channel **${channel.name}** is now visible to **${role}**.`, '#ff9900')],
                ephemeral: true
            });
            let now = new Date();
            let formattedDate = format(now, 'yyyy-MM-dd HH:mm:ss');
            console.log(`[${colors.FgMagenta + formattedDate + colors.Reset}] Channel "${colors.FgYellow + channel.name + colors.Reset}" unhidden by ${colors.FgYellow + interaction.user.tag + colors.Reset} (${interaction.user.id})`);
            
        } catch (err) {
            console.error(err);
            interaction.reply({
                embeds: [createEmbed('Error', 'Error while showing the channel.', '#ff0000')],
                ephemeral: true
            });
        }
    }
    
    // set-channel command
    if (interaction.commandName === 'set-channel') {
        const channel = interaction.options.getChannel('channel');
        const guild_id = interaction.guild.id;
        const guild_name = interaction.guild.name;
        const user_id = interaction.user.id;
        const user_name = interaction.user.tag;

        if (!channel) {
            return interaction.reply({
                embeds: [createEmbed('Error', 'Channel not found.', '#ff0000')],
                ephemeral: true
            });
        }
        
        // Save to config.json
        const configUpdated = updateConfig(guild_id, channel.id, user_id, guild_name, user_name);
        if (!configUpdated) {
            return interaction.reply({
                embeds: [createEmbed('Error', 'Failed to save configuration.', '#ff0000')],
                ephemeral: true
            });
        }

        await interaction.reply({
            embeds: [createEmbed('✅ Channel set')
                .addFields(
                    { name: 'Channel', value: `**${channel.name}** (\`${channel.id}\`)`, inline: false },
                    { name: 'Server', value: `**${interaction.guild.name}** (\`${interaction.guild.id}\`)`, inline: false },
                    { name: 'Config by', value: `**${interaction.user.tag}** (\`${interaction.user.id}\`)`, inline: false },
                )
                .setColor('#5865F2')],
            ephemeral: true
        });
        let now = new Date();
        let formattedDate = format(now, 'yyyy-MM-dd HH:mm:ss');
        console.log(`[${colors.FgMagenta + formattedDate + colors.Reset}] Target channel set to "${colors.FgYellow + channel.name + colors.Reset}" by ${colors.FgYellow + interaction.user.tag + colors.Reset} (${interaction.user.id})`);
    }

    // show-config command
    if (interaction.commandName === 'show-config') {
        const serverConfig = getServerConfig(interaction.guild.id);
        if (!serverConfig) {
            return interaction.reply({
                embeds: [createEmbed('ℹ️ Current Config', 'No channel configured. Use `/set-channel` first.', '#5865F2')],
                ephemeral: true
            });
        }
        
        const channel = await interaction.guild.channels.fetch(serverConfig.channelId);
        if (!channel) {
            return interaction.reply({
                embeds: [createEmbed('ℹ️ Current Configuration', 'Configured channel not found.', '#5865F2')],
                ephemeral: true
            });
        }

        await interaction.reply({
            embeds: [createEmbed('Current Configuration')
                .addFields(
                    { name: 'Channel', value: `**${channel.name}** (\`${serverConfig.channelId}\`)`, inline: false },
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
        interaction.reply({content: 'Command currenly **not working** and causing server craches.', ephemeral: true})
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