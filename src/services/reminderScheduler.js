
import {
    recoverStaleReminders,
    claimDueReminders,
    markCompleted,
    markFailed,
    recurringReminder
} from "../repositories/reminderQueries.js";

export function reminderScheduler(client) {
    let running = false;

    setInterval(async () => {
        if (running) return;

        running = true;
        try {
            await runReminder(client);
        } catch (error) {
            console.error("Reminder scheduler error:", error);
        } finally {
            running = false;
        }
    }, 5000);
}

async function runReminder(client) {
    await recoverStaleReminders();

    const reminders = await claimDueReminders();

    for (const reminder of reminders) {
        try {
            const channel = await client.channels.fetch(
                reminder.channelId
            );

            if (!channel || !channel.isTextBased()) {
                console.error(
                    `Invalid text channel for reminder ${reminder.id}`
                );
                await markFailed(reminder.id);
                continue;
            }

            const createdAgo = `<t:${Math.floor(
                new Date(reminder.createdAt).getTime() / 1000
            )}:R>`;

            const reminderEmbed = {
                title: `Reminder about "${reminder.message}"`,
                color: parseInt("#dee4db", 16),
                description: `Created ${createdAgo}`,
                footer: {
                    text: "Reminder"
                },
                timestamp: new Date()
            };

            await channel.send({
                content: reminder.mentionUser
                    ? `<@${reminder.userId}>`
                    : undefined,
                embeds: [reminderEmbed],
                allowedMentions: {
                    users: reminder.mentionUser
                        ? [reminder.userId]
                        : []
                }
            });

            if (reminder.intervalSeconds) {
                const intervalMs = reminder.intervalSeconds * 1000;
                const now = Date.now();
                const previousRemindAt = new Date(reminder.remindAt).getTime();

                let nextRemindAt = previousRemindAt + intervalMs;

                if (nextRemindAt <= now) {
                    const missedIntervals =
                        Math.floor((now - nextRemindAt) / intervalMs) + 1;

                    nextRemindAt += missedIntervals * intervalMs;
                }

                await recurringReminder(
                    reminder.id,
                    new Date(nextRemindAt)
                );
            } else {
                await markCompleted(reminder.id);
            }

        } catch (error) {
            if (error.code === 10003 || error.code === 50035) {
                try {
                    await markFailed(reminder.id);
                } catch (updateError) {
                    console.error(
                        `Could not mark reminder ${reminder.id} failed:`,
                        updateError
                    );
                }
            } else {
                console.error(
                    `Failed reminder ${reminder.id}:`,
                    error
                );
            }
        }
    }
}
