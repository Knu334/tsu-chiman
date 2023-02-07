import webPush from "web-push";
import jwt from "jsonwebtoken";
import { Client, GatewayIntentBits } from "discord.js";

import { PrismaClient } from "@prisma/client";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
const prisma = new PrismaClient();

client.on("ready", async () => {
  const data = [
    {
      name: "tsu-chiman",
      description: "Reply URL for registration of WebPush notification.",
    },
  ];
  if (client.application) {
    await client.application.commands.set(data);
  }
  console.log("ready...");
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  if (!oldChannel && newChannel) {
    let members = Array.from(newChannel.members.values(), (m) => m.displayName);
    const notification = {
      title: newState.member!.displayName + " がボイスチャンネルに参加しました",
      body: "Member: " + members,
      icon: newChannel.guild.iconURL(),
      data: "discord://discordapp.com/channels/" + newChannel.guild.id,
    };

    const android = {
      title: newState.member!.displayName + " がボイスチャンネルに参加しました",
      body: "Member: " + members,
      icon: newChannel.guild.iconURL(),
      data: "https://discord.com/channels/" + newChannel.guild.id,
    };

    const selectQuery = {
      text: "SELECT * FROM push_subscription WHERE serverid=$1",
      values: [newChannel.guild.id],
    };

    // WebPush通知の送信先を取得する
    let qres = await prisma.subscription.findMany({
      where: {
        AND: {
          serverid: newChannel.guild.id,
        },
      },
    });
    // await pool.query(selectQuery);

    // WebPush通知を送信する
    for (let row of qres) {
      try {
        const pushSubscription = {
          keys: {
            auth: row.auth,
            p256dh: row.p256dh,
          },
          endpoint: row.endpoint,
        } as webPush.PushSubscription;
        if (row.os === 0) {
          await webPush.sendNotification(
            pushSubscription,
            JSON.stringify(notification)
          );
        } else if (row.os === 1) {
          await webPush.sendNotification(
            pushSubscription,
            JSON.stringify(android)
          );
        }
      } catch (e: any) {
        // WebPush通知の送信先情報が期限切れの場合は該当情報を削除
        if (e.statusCode === 410) {
          prisma.subscription.delete({
            where: {
              serverid_userid_endpoint_auth_p256dh: {
                serverid: row.serverid,
                userid: row.userid,
                endpoint: row.endpoint,
                auth: row.auth,
                p256dh: row.p256dh,
              },
            },
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

  if (!interaction.member || !interaction.guild) {
    return;
  }

  const payload = {
    userId: interaction.member.user.id,
    serverId: interaction.guild.id,
    createdTimestamp: interaction.createdTimestamp,
  };

  const options = {
    expiresIn: "5m",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, options);

  if (interaction.commandName === "tsu-chiman") {
    await interaction.user.send(
      `${process.env.REGIST_PAGE_URL}/tsu-chiman?token=${token}`
    );
    await interaction.reply("登録URLをDM送信しました");
  }
});

client.login(process.env.DISCORD_TOKEN);
