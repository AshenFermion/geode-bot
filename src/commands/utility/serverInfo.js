import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { formatDate } from "../../helpers/utils.js";

export default {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Provides Server Details'),

    async execute(interaction) {
        const server = interaction.guild;

        const owner = await server.fetchOwner();

        await server.members.fetch();

        const botCount = await server.members.cache.filter(
            member => member.user.bot
        ).size;

        const rolesCount = server.roles.cache.size;

        const textChannels = server.channels.cache.filter(
            channel => channel.type === 0
        ).size;

        const voiceChannels = server.channels.cache.filter(
            channel => channel.type === 2
        ).size;

        const verificationLevels = {
            0: "None",
            1: "Low",
            2: "Medium",
            3: "High",
            4: "Very High"
        };

        let buttons;

        const guildAvatar = server.iconURL({
            size: 4096,
            extension: "png"
        });

        if (guildAvatar) {
            const avatarButton = new ButtonBuilder()
                .setLabel("View Avatar")
                .setStyle(ButtonStyle.Link)
                .setURL(guildAvatar);

            buttons = new ActionRowBuilder()
                .addComponents(avatarButton);
        }

        const serverEmbed = {
            title: 'Server Information',
            color: parseInt('#4a4c51', 16),
            thumbnail: {
                url: server.iconURL({ size: 256 })
            },
            fields: [
                {
                    name: 'Server Name',
                    value: server.name,
                    inline: true
                },
                {
                    name: 'Owner',
                    value: owner.user.username,
                    inline: true
                },
                {
                    name: 'Created At',
                    value: formatDate(server.createdTimestamp),
                    inline: true
                },
                {
                    name: 'Member Count',
                    value: `${server.memberCount}`,
                    inline: true
                },
                {
                    name: 'Bots',
                    value: `${botCount}`,
                    inline: true
                },
                {
                    name: 'Roles',
                    value: `${rolesCount}`,
                    inline: true
                },
                {
                    name: 'Text Channels',
                    value: `${textChannels}`,
                    inline: true
                },
                {
                    name: 'Voice Channels',
                    value: `${voiceChannels}`,
                    inline: true
                },
                {
                    name: 'Verification Level',
                    value: verificationLevels[server.verificationLevel],
                    inline: true
                },
                {
                    name: 'Boosts',
                    value: `${server.premiumSubscriptionCount ?? 0}`,
                    inline: true
                },
                {
                    name: 'Boost Level',
                    value: `Level ${server.premiumTier}`,
                    inline: true
                },
                {
                    name: 'Emotes',
                    value: `${server.emojis.cache.size}`,
                    inline: true
                },
                {
                    name: 'Server ID',
                    value: `\`${server.id}\``,
                    inline: false
                }

            ],
            footer: {
                text: `Created at`
            },
            timestamp: new Date()
        };
        const reply = {
            embeds: [serverEmbed]
        };

        if (buttons) {
            reply.components = [buttons];
        }

        await interaction.reply(reply);
    }
}