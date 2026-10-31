#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/11fe5e5881f25b1020278125bad906ffa9182e3800711caa93d8619bc28ac505/contract.json';
import endContract from '../../snapshots/11fe5e5881f25b1020278125bad906ffa9182e3800711caa93d8619bc28ac505/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d9c1fa35352ac05f4fec4c9809909691d06937eeec3c2276b13935c8920d1b78/contract';
import startContract from '../../snapshots/d9c1fa35352ac05f4fec4c9809909691d06937eeec3c2276b13935c8920d1b78/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Reminder',
        column: col('claimedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Reminder',
        column: col('mentionUser', 'bool', {
          notNull: true,
          default: lit(true),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Reminder',
        column: col('status', 'text', {
          notNull: true,
          default: lit('pending'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
          schema: 'public',
          table: 'Reminder',
          column: col('channelId', 'text', {
              notNull: true,
              codecRef: { codecId: 'pg/text@1' }
          }),
      }),
      this.setNotNull({ schema: 'public', table: 'Reminder', column: 'channelId' }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Reminder',
        constraint: 'Reminder_status_check_d21e5f1b',
        expression: "\"status\" IN ('pending', 'processing', 'completed')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
