#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/20dac5dbba8e099362da9cb593eea594295926da80ceba72ca89eba67f1dac3a/contract';
import startContract from '../../snapshots/20dac5dbba8e099362da9cb593eea594295926da80ceba72ca89eba67f1dac3a/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7ebcca5b37eef1a4ae5cfa28c3d166e30be51ff3496674bb572167efaec55e3d/contract';
import endContract from '../../snapshots/7ebcca5b37eef1a4ae5cfa28c3d166e30be51ff3496674bb572167efaec55e3d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Reminder',
        column: col('intervalSeconds', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
