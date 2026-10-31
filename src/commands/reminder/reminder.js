
import { SlashCommandBuilder } from "discord.js";
import { createReminder } from "../../repositories/reminderQueries.js";

const MAX_DURATION = 365 * 24 * 60 * 60 * 1000;
const MIN_INTERVAL = 60 * 1000;

const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
};

function parseDuration(input) {
    const parts = [...input.matchAll(/(\d+)\s*(s|m|h|d)/gi)];
    const normalized = input.replace(/\s+/g, "").toLowerCase();
    const parsed = parts
        .map(part => part[0].replace(/\s+/g, "").toLowerCase())
        .join("");

    if (!parts.length || parsed !== normalized) {
        return null;
    }

    let duration = 0;

    for (const part of parts) {
        const amount = Number(part[1]);
        const unit = part[2].toLowerCase();

        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return null;
        }

        duration += amount * units[unit];

        if (!Number.isSafeInteger(duration) || duration > MAX_DURATION) {
            return null;
        }
    }

    return duration;
}

export default {
    cooldown: 5,

    data: new SlashCommandBuilder()
        .setName("reminder")
        .setDescription("Sets a custom reminder")
        .addStringOption(option =>
            option
                .setName("in")
                .setDescription("When to remind you, e.g. 10m, 2h, 1d")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("What should I remind you about?")
                .setMaxLength(1000)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("recurring")
                .setDescription("Repeat interval, e.g. 1h, 1d, or 1d 12h")
                .setRequired(false)
        ),

    async execute(interaction) {
        const durationInput = interaction.options.getString("in", true).trim();
        const message = interaction.options.getString("message", true).trim();
        const recurringInput = interaction.options.getString("recurring")?.trim();

        const duration = parseDuration(durationInput);

        if (duration === null || !message) {
            return interaction.reply({
                content: "Use a valid duration like `30s`, `10m`, `2h`, `1d`, or `1m 2s`.",
                flags: 64
            });
        }

        let intervalSeconds = null;

        if (recurringInput) {
            const interval = parseDuration(recurringInput);

            if (interval === null) {
                return interaction.reply({
                    content: "Enter a valid repeat interval, such as `1m`, `1h`, or `1d 12h`.",
                    flags: 64
                });
            }

            if (interval < MIN_INTERVAL) {
                return interaction.reply({
                    content: "Recurring reminders must repeat at least every 1 minute.",
                    flags: 64
                });
            }

            intervalSeconds = interval / 1000;
        }

        const remindAt = new Date(Date.now() + duration);

        try {
            await createReminder(
                interaction.user.id,
                interaction.channelId,
                message,
                remindAt,
                true,
                intervalSeconds
            );

            const timing = `<t:${Math.floor(remindAt.getTime() / 1000)}:R>`;
            const recurrenceText = intervalSeconds
                ? `\nRepeats every **${recurringInput}**.`
                : "";

            const reminderEmbed = {
                title: "Reminder",
                color: parseInt("#4a4c51", 16),
                description:
                    `<@${interaction.user.id}> Alright, I'll remind you ${timing} about:\n\n` +
                    `"${message}"${recurrenceText}`,
                footer: {
                    text: `Reminder set by ${interaction.user.username}`
                },
                timestamp: new Date()
            };

            await interaction.reply({
                embeds: [reminderEmbed]
            });

        } catch (error) {
            console.error("Failed to create reminder:", error);

            const response = {
                content: "An error occurred while creating the reminder.",
                flags: 64
            };

            if (interaction.replied || interaction.deferred) {
                return interaction.followUp(response);
            }

            return interaction.reply(response);
        }
    }
};
