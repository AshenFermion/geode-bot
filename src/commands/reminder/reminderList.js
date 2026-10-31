
import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { getUserReminders } from "../../repositories/reminderQueries.js";

export default {
    cooldown: 5,

    data: new SlashCommandBuilder()
        .setName("reminderlist")
        .setDescription("Lists your active reminders"),

    async execute(interaction) {
        try {
            const reminders = await getUserReminders(interaction.user.id);

            if (!reminders.length) {
                return interaction.reply({
                    content: "You have no active reminders.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const description = reminders
                .slice(0, 25)
                .map(reminder => {
                    const due = `<t:${Math.floor(
                        new Date(reminder.remindAt).getTime() / 1000
                    )}:R>`;

                    const recurring = reminder.intervalSeconds
                        ? ` · Repeats every ${reminder.intervalSeconds >= 86400
                            ? `${reminder.intervalSeconds / 86400}d`
                            : reminder.intervalSeconds >= 3600
                                ? `${reminder.intervalSeconds / 3600}h`
                                : `${reminder.intervalSeconds / 60}m`}`
                        : "";

                    return `**#${reminder.id} — ${reminder.message}**\nDue ${due}${recurring}`;
                })
                .join("\n\n");

            const embed = {
                title: "Your Reminders",
                color: parseInt("#4a4c51", 16),
                description,
                footer: {
                    text: `Showing ${Math.min(reminders.length, 25)} of ${reminders.length} reminders`
                },
                timestamp: new Date()
            };

            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error("Failed to list reminders:", error);

            return interaction.reply({
                content: "Couldn't load your reminders. Please try again later.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
