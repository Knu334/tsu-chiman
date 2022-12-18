const webPush = require('web-push');
const jwt = require("jsonwebtoken");
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const authTokens = require('./auth.json')
const pool = require('./pool');

client.on('ready', async () => {
    const data = [{
        name: "tsu-chiman",
        description: "Reply URL for registration WebPush Notification",
    }];
    await client.application.commands.set(data);
    console.log('ready...');
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    let oldChannel = oldState.channel;
    let newChannel = newState.channel;

    if (oldChannel == null && newChannel != null) {
        let members = Array.from(newChannel.members.values(), m => m.displayName);
        let notification = {
            'title': newState.member.displayName + ' がボイスチャンネルに参加しました',
            'body': 'Member: ' + members,
            'icon': newChannel.guild.iconURL(),
            'data': 'discord://discordapp.com/channels/' + newChannel.guild.id
        };

        const selectQuery = {
            text: "SELECT subscription FROM push_subscription WHERE serverid=$1",
            values: [newChannel.guild.id]
        };

        try {
            const qres = await pool.query(selectQuery);
            try {
                for (let row of qres.rows) {
                    await webPush.sendNotification(row.subscription, JSON.stringify(notification));
                }
            } catch (e1) {
                const delQuery = {
                    text: "DELETE FROM push_subscription WHERE serverid=$1::text AND subscription=$2::jsonb",
                    values: [newChannel.guild.id, row.subscription]
                };
                try {
                    await pool.query(delQuery);
                } catch (e2) {
                    console.log('Subscription delete error');
                }
            }
        } catch (e) {
            console.error(e.stack);
        };
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const payload = {
        displayName: interaction.member.displayName,
        createdTimestamp: interaction.createdTimestamp
    };

    const options = {
        expiresIn: '5m'
    }

    const token = jwt.sign(payload, authTokens.jwtSecretKey, options);

    if (interaction.commandName === 'tsu-chiman') {
        await interaction.reply(`${process.env.REGIST_PAGE_URL}/tsu-chiman?serverId=${interaction.guild.id}&token=${token}`);
    }
});

client.login(authTokens.discordToken);