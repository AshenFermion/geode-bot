#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/11fe5e5881f25b1020278125bad906ffa9182e3800711caa93d8619bc28ac505/contract';
import startContract from '../../snapshots/11fe5e5881f25b1020278125bad906ffa9182e3800711caa93d8619bc28ac505/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/20dac5dbba8e099362da9cb593eea594295926da80ceba72ca89eba67f1dac3a/contract';
import endContract from '../../snapshots/20dac5dbba8e099362da9cb593eea594295926da80ceba72ca89eba67f1dac3a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'Reminder',
        constraint: 'Reminder_status_check_d21e5f1b',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Reminder',
        constraint: 'Reminder_status_check_823dfc49',
        expression: "\"status\" IN ('pending', 'processing', 'completed', 'failed')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
