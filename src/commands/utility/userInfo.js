import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { formatDate } from "../../helpers/utils.js";

export default {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Provides Basic User Details')
        .addUserOption(option => 
            option
                .setName("user")
                .setDescription("The User to Inspect")
                .setRequired(false)
        ),
        
    async execute(interaction) {
        const user = interaction.options.getUser("user") ?? interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        const avatarURL = user.displayAvatarURL({
            size: 4096,
            extension: "png"
        });

        const profileButton = new ButtonBuilder()
            .setLabel("View Profile")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/users/${user.id}`);

        const avatarButton = new ButtonBuilder()
            .setLabel("View Avatar")
            .setStyle(ButtonStyle.Link)
            .setURL(avatarURL);

        const buttons = new ActionRowBuilder()
            .addComponents(profileButton, avatarButton);

        const userEmbed = {
            title: 'Account Information',
            color: parseInt(member.displayHexColor.replace('#', ''), 16), 
            thumbnail: {
                url: user.displayAvatarURL({ size: 256 })
            },
            fields: [
                {
                    name: "Display Name",
                    value: user.globalName ?? user.username,
                    inline: true
                },
                {
                    name: "Username",
                    value: user.username,
                    inline: true
                },
                {
                    name: "Server Nickname",
                    value: member.nickname ?? user.globalName ?? user.username,
                    inline: true
                },

                {
                    name: "Account Created",
                    value: formatDate(user.createdTimestamp),
                    inline: true
                },
                {
                    name: "Joined",
                    value: formatDate(member.joinedTimestamp),
                    inline: true
                },
                {
                    name: "Nickname",
                    value: member.nickname ?? "None",
                    inline: true
                },
                {
                    name: "User ID",
                    value: `\`${user.id}\``,
                    inline: false
                },
                {
                    name: "Roles",
                    value: member.roles.cache
                        .filter(role => role.id !== interaction.guild.id)
                        .map(role => role.toString())
                        .join(", ") || "None",
                    inline:false
                },
            ],
            footer: {
                text: `Created at`
            },
            timestamp: new Date()
        };
        await interaction.reply({
            embeds: [userEmbed],
            components: [buttons]
        });
    }
}