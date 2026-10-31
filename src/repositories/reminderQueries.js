import { db } from "../prisma/db.js";

export async function createReminder(userId, channelId, message, remindAt, mentionUser = true, intervalSeconds = null) {
    return await db.orm.public.Reminder.create({
        userId,
        channelId,
        message,
        remindAt,
        mentionUser,
        intervalSeconds
    })
}

export async function claimDueReminders() {
    return await db.transaction(async (tx) => {
        const plan = db.raw.sql`
            WITH claimed AS (
                SELECT id
                FROM "Reminder"
                WHERE status = 'pending'
                  AND "remindAt" <= NOW()
                ORDER BY "remindAt"
                LIMIT 5
                FOR UPDATE SKIP LOCKED
            )
            UPDATE "Reminder" r
            SET
                status = 'processing',
                "claimedAt" = NOW()
            FROM claimed
            WHERE r.id = claimed.id
            RETURNING r.*;
        `
        .returnsRow({
            id: "pg/int4@1",
            channelId: "pg/text@1",
            userId: "pg/text@1",
            message: "pg/text@1",
            mentionUser: "pg/bool@1",
            intervalSeconds: "pg/int4@1",
            status: "pg/text@1",
            remindAt: "pg/timestamptz-date@1",
            createdAt: "pg/timestamptz-date@1",
            claimedAt: "pg/timestamptz-date@1"
        })
        .build();

        const rows = [];

        for await (const row of tx.query(plan)) {
            rows.push(row);
        }

        return rows;
    });
}

export async function markCompleted(id) {
    return db.orm.public.Reminder
        .where({ id })
        .update({ status: "completed"})
}

export async function recurringReminder(id, nextRemindAt) {
    return await db.orm.public.Reminder
        .where({ id })
        .update({
            status: "pending",
            remindAt: nextRemindAt,
            claimedAt: null
        });
}

export async function recoverStaleReminders() {
    const plan = db.raw.sql`
        UPDATE "Reminder"
        SET
            status = 'pending',
            "claimedAt" = NULL
        WHERE status = 'processing'
          AND "claimedAt" < NOW() - INTERVAL '30 seconds'
        RETURNING *;
    `
    .returnsRow({
        id: "pg/int4@1",
        channelId: "pg/text@1",
        userId: "pg/text@1",
        message: "pg/text@1",
        mentionUser: "pg/bool@1",
        status: "pg/text@1",
        remindAt: "pg/timestamptz-date@1",
        createdAt: "pg/timestamptz-date@1",
        claimedAt: "pg/timestamptz-date@1"
    })
    .build();

    return await db.runtime().execute(plan);
}

export async function markFailed(id) {
    return await db.orm.public.Reminder
        .where({ id })
        .update({
            status: "failed"
        });
}

export async function getUserReminders(userId) {
    const plan = db.raw.sql`
        SELECT *
        FROM "Reminder"
        WHERE "userId" = ${userId}
          AND status IN ('pending', 'processing')
        ORDER BY "remindAt" ASC;
    `
    .returnsRow({
        id: "pg/int4@1",
        channelId: "pg/text@1",
        userId: "pg/text@1",
        message: "pg/text@1",
        mentionUser: "pg/bool@1",
        intervalSeconds: "pg/int4@1",
        status: "pg/text@1",
        remindAt: "pg/timestamptz-date@1",
        createdAt: "pg/timestamptz-date@1",
        claimedAt: "pg/timestamptz-date@1"
    })
    .build();

    return await db.transaction(async (tx) => {
        const reminders = [];

        for await (const row of tx.query(plan)) {
            reminders.push(row);
        }

        return reminders;
    });
}

export async function removeReminder(id, userId) {
    return await db.orm.public.Reminder
        .where({
            id,
            userId,
            status: "pending"
        })
        .update({
            status: "completed"
        });
}