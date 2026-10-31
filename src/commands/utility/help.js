import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
    cooldown: 5,

    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows all available Geode commands"),

    async execute(interaction) {
        const commands = [...interaction.client.commands.values()]
            .filter(command => command.data)
            .sort((a, b) =>
                a.data.name.localeCompare(b.data.name)
            );

        const commandList = commands.map(command =>
            `**/${command.data.name}**\n${command.data.description}`
        );

        const embed = new EmbedBuilder()
            .setTitle("Geode Help")
            .setColor(0x4a4c51)
            .setDescription(
                commandList.join("\n\n") ||
                "No commands are currently available."
            )
            .setFooter({
                text: `${commands.length} commands available`
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};