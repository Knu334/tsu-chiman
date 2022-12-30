const webPush = require('web-push');
const jwt = require("jsonwebtoken");
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const authTokens = require('./auth.json')
const pool = require('./pool');

client.on('ready', async () => {
    const data = [{
        name: "tsu-chiman",
        description: "Reply URL for registration of WebPush notification.",
    }];
    await client.application.commands.set(data);
    console.log('ready...');
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    let oldChannel = oldState.channel;
    let newChannel = newState.channel;

    if (oldChannel == null && newChannel != null) {
        let members = Array.from(newChannel.members.values(), m => m.displayName);
        const notification = {
            'title': newState.member.displayName + ' がボイスチャンネルに参加しました',
            'body': 'Member: ' + members,
            'icon': newChannel.guild.iconURL(),
            'data': 'discord://discordapp.com/channels/' + newChannel.guild.id
        };

        const android = {
            'title': newState.member.displayName + ' がボイスチャンネルに参加しました',
            'body': 'Member: ' + members,
            'icon': newChannel.guild.iconURL(),
            'data': 'https://discord.com/channels/' + newChannel.guild.id
        }

        const selectQuery = {
            text: "SELECT * FROM push_subscription WHERE serverid=$1",
            values: [newChannel.guild.id]
        };

        // WebPush通知の送信先を取得する
        let qres = await pool.query(selectQuery);

        // WebPush通知を送信する
        for (let row of qres.rows) {
            try {
                if (row.os === 0) {
                    await webPush.sendNotification(row.subscription, JSON.stringify(notification));
                } else if (row.os === 1) {
                    await webPush.sendNotification(row.subscription, JSON.stringify(android));
                }
            } catch (e) {
                // WebPush通知の送信先情報が期限切れの場合は該当情報を削除
                if (e.statusCode === 410) {
                    const delQuery = {
                        text: "DELETE FROM push_subscription WHERE serverid=$1::text AND subscription=$2::jsonb",
                        values: [newChannel.guild.id, row.subscription]
                    };

                    pool.query(delQuery).catch(() => {
                        throw new Error('Subscription delete error: endpoint=' + e.endpoint);
                    });
                }
            }
        }
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const payload = {
        displayName: interaction.member.displayName,
        serverId: interaction.guild.id,
        createdTimestamp: interaction.createdTimestamp
    };

    const options = {
        expiresIn: '5m'
    }

    const token = jwt.sign(payload, authTokens.jwtSecretKey, options);

    if (interaction.commandName === 'tsu-chiman') {
        await interaction.user.send(`${process.env.REGIST_PAGE_URL}/tsu-chiman?token=${token}`);
        await interaction.reply('登録URLをDM送信しました');
    }
});

client.login(authTokens.discordToken);