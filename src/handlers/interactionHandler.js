import {
    Events,
    MessageFlags,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder
} from "discord.js";

import {
    getUserReminders,
    removeReminder
} from "../repositories/reminderQueries.js";

function buildReminderMenu(reminders) {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("reminderremove_select")
            .setPlaceholder("Select a reminder to remove")
            .addOptions(
                reminders.slice(0, 25).map(reminder => ({
                    label: reminder.message.slice(0, 100),
                    description: `Due ${new Date(reminder.remindAt).toLocaleString()}`
                        .slice(0, 100),
                    value: String(reminder.id)
                }))
            )
    );
}

export function loadInteractions(client) {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId !== "reminderremove_select") return;

            try {
                await interaction.deferUpdate();

                const reminderId = Number(interaction.values[0]);

                if (!Number.isInteger(reminderId) || reminderId <= 0) {
                    await interaction.followUp({
                        content: "Invalid reminder selected.",
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                await removeReminder(reminderId, interaction.user.id);

                const reminders = await getUserReminders(
                    interaction.user.id
                );

                if (reminders.length === 0) {
                    await interaction.editReply({
                        content: "Reminder removed successfully. You have no more active reminders to remove.",
                        embeds: [],
                        components: []
                    });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle("Remove a Reminder")
                    .setColor(0x4a4c51)
                    .setDescription(
                        `Reminder removed successfully.\n\nYou have ${reminders.length} active reminder(s) remaining. Select another to remove it.`
                    );

                await interaction.editReply({
                    content: "Select the reminder you want to remove:",
                    embeds: [embed],
                    components: [buildReminderMenu(reminders)]
                });
            } catch (error) {
                console.error("Failed to remove reminder:", error);

                await interaction.followUp({
                    content: "Couldn't remove that reminder. Please try again.",
                    flags: MessageFlags.Ephemeral
                }).catch(console.error);
            }

            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(
            interaction.commandName
        );

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found`
            );
            return;
        }

        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Map());
        }

        const timestamps = cooldowns.get(command.data.name);
        const now = Date.now();
        const cooldownAmount = (command.cooldown ?? 3) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime =
                timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(
                    expirationTime / 1000
                );

                await interaction.reply({
                    content: `Please wait, you are on cooldown. Try again <t:${expiredTimestamp}:R>.`,
                    flags: MessageFlags.Ephemeral
                });

                setTimeout(() => {
                    interaction.deleteReply().catch(() => {});
                }, expirationTime - now);

                return;
            }
        }

        timestamps.set(interaction.user.id, now);

        setTimeout(
            () => timestamps.delete(interaction.user.id),
            cooldownAmount
        );

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            const response = {
                content: "There was an error while executing this command!",
                flags: MessageFlags.Ephemeral
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    });
}