const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const auth = require('./auth.json')
client.on('ready', () => {
    console.log('ready...');
});
client.on('voiceStateUpdate', (oldState, newState) => {
    let oldChannel = oldState.channel;
    let newChannel = newState.channel;

    if (oldChannel == null && newChannel != null) {
        let members = Array.from(newChannel.members.values(), m => m.displayName);
        console.log(newChannel.guild.id);
        let notification = {
            'title': newState.member.displayName + ' がボイスチャンネルに参加しました',
            'body': 'Member: ' + members,
            'icon': newChannel.guild.iconURL(),
            'click_action': 'discord://discordapp.com/channels/' + newChannel.guild.id
        };

        fetch('https://fcm.googleapis.com/fcm/send', {
            'method': 'POST',
            'headers': {
                'Authorization': 'key=' + auth.firebaseToken,
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify({
                'notification': notification,
                'to': '/topics/discord-join-' + newChannel.guild.id
            })
        }).then(function (response) {
            console.log(response);
        }).catch(function (error) {
            console.error(error);
        })
    }
});
client.login(auth.discordToken);