import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export default {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('useravatar')
        .setDescription('Shows Avatar of a Specific User')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Avatar of the Selected User')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser("user") ?? interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const avatarURL = user.displayAvatarURL({
            size: 4096,
            extension: "png"
        });

        const avatarButton = new ButtonBuilder()
            .setLabel("View Avatar")
            .setStyle(ButtonStyle.Link)
            .setURL(avatarURL);

        const row = new ActionRowBuilder()
            .addComponents(avatarButton);

        const userEmbed = {
            title: `${user.globalName ?? user.username}'s Avatar`,
            image: {
                url: avatarURL
            },
            color: parseInt(member.displayHexColor.replace('#', ''), 16),
            footer: {
                text: `Created at`
            },
            timestamp: new Date()
        };
        await interaction.reply({
            embeds: [userEmbed],
            components: [row]
        });
    }
}