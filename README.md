<h1 align="center">Discord Channel Hider Bot</h1>
<h3 align="center">Quickly hide/unhide a Specific Channel from Everyone in the Discord Server</h3>

---

<h4 align="center"><a href="https://discord.com/oauth2/authorize?client_id=1432776506173685880&permissions=8&integration_type=0&scope=bot" target="_blank">Add Channel Hider Bot to your Server now! 🌟</a></h4>


## Requirements:
- Download and install [Node.js](https://nodejs.org/en/download) (latest v24)
- Your own Discord bot via [Discord Developer Portal](https://discord.dev)

## Features:
| Slash command  | Description |
| ------------- | ------------- |
| **/set-channel [channel]**  | sets which channel to hide/unhide  |
| **/hide-channel**  | hides the channel from everyone  |
| **/unhide-channel**  | unhides the channel from everyone  |
| **/show-config** |  Show the current configuration |
| **/ping**  | gets the bot's latency  |
| **/help**  | shows all available commands  |

## Setup and running:
1. **Download the repositary to your computer/server. Choose which option your prefer more:**
 - Click the **blue button** `Code` > `Download ZIP` on the main page
 - Clone with `git clone https://gitea.oryks.org/sejmix/discord-channel-hider.git` in your terminal

2. **Navigate to the project's directory**
3. **Install dependencies**
 - run `npm install` in your terminal to install **all packgaes**
4. **Configuring** ⚙️
 - open `.env` file to configurate:
    - replace `TOKEN` with your **bot token**
    - replace `BOT_ID` with your **bot ID**
    - replace `GUILD_ID` with the **server ID** your bot is in

5. **Start the bot** 🎉
 - run `node 'src/slash-commands.js'` to **register slash commands**
 - finally, run `node 'src/index.js'` to **start the bot**

> [!NOTE]
> You have to run `node 'src/slash-commands.js'` only once. The slash commands will be registered in your Discord Guild/Server.

### Enjoy!

## TODO:
- [x] Save config to a file `config.json` instead of a local variable
- [x] Add embeded messages instead of normal replies
- [x] Add `/show-config` command to check the current configuration
- [ ] Multiple channels/categories support **(maybe)**
- [ ] Role provilages - only allowed people can use bot`s commands


## Report an issue or suggestion 
If you found a bug or have an idea, create a new issue in the [Issue tab](https://gitea.oryks.org/sejmix/discord-channel-hider/issues) or create a new [Pull request](https://gitea.oryks.org/sejmix/discord-channel-hider/pulls)

---
Made by [sejmix](https://gitea.oryks.org/sejmix) from Orkys Team <3