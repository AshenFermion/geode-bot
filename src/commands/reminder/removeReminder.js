
import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags
} from "discord.js";

import { getUserReminders } from "../../repositories/reminderQueries.js";

export default {
    cooldown: 5,

    data: new SlashCommandBuilder()
        .setName("reminderremove")
        .setDescription("Remove one of your active reminders"),

    async execute(interaction) {
        try {
            const reminders = await getUserReminders(interaction.user.id);

            if (!reminders.length) {
                return interaction.reply({
                    content: "You have no active reminders to remove.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const options = reminders.slice(0, 25).map(reminder => ({
                label: reminder.message.slice(0, 100),
                description: `Due ${new Date(reminder.remindAt).toLocaleString()}`.slice(0, 100),
                value: String(reminder.id)
            }));

            const menu = new StringSelectMenuBuilder()
                .setCustomId("reminderremove_select")
                .setPlaceholder("Select a reminder to remove")
                .addOptions(options);

            const row = new ActionRowBuilder()
                .addComponents(menu);

            return interaction.reply({
                content: "Select the reminder you want to remove:",
                components: [row],
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error("Failed to fetch reminders:", error);

            return interaction.reply({
                content: "Couldn't load your reminders. Please try again later.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
