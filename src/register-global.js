// src/register-global.js
// Registers slash commands for any server the bot is in (globally)

require('dotenv').config({quiet: true});
const { REST, Routes, ApplicationCommandOptionType, AuditLogOptionsType } = require('discord.js');


const commands = [
  {
    name: "ping",
    description: "Check latency",
  },
  {
    name: "help",
    description: "Check available commands",
  },
  {
    name: "hide-channel",
    description: "Hide a specific channel from everyone",
  },
  {
    name: "unhide-channel",
    description: "Unhide a specific channel for everyone",
  },
  {
    name: "set-channel",
    description: "Set the target channel to hide/unhide",
    options: [
        {
          name: "channel1",
          description: "The 1. channel to set as target",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
        {
          name: "channel2",
          description: "The 2. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel3",
          description: "The 3. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel4",
          description: "The 4. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel5",
          description: "The 5. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel6",
          description: "The 6. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel7",
          description: "The 7. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel8",
          description: "The 8. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel9",
          description: "The 9. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel10",
          description: "The 10. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel11",
          description: "The 11. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel12",
          description: "The 12. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel13",
          description: "The 13. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel14",
          description: "The 14. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel15",
          description: "The 15. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel16",
          description: "The 16. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel17",
          description: "The 17. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel18",
          description: "The 18. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel19",
          description: "The 19. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel20",
          description: "The 20. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel21",
          description: "The 21. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel22",
          description: "The 22. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel23",
          description: "The 23. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel24",
          description: "The 24. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "channel25",
          description: "The 25. channel to set as target (optional)",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
  },
  {
    name: "channel-status",
    description: "Check if the target channel is hidden or visible",
  }
];


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registering global slash commands...');

    await rest.put(
      Routes.applicationCommands(process.env.BOT_ID), // Changed to global commands
      { body: commands }
    );

    console.log('Global slash commands were registered successfully!');
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();