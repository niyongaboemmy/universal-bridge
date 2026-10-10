import * as migration_20261010_120600_initial from './20261010_120600_initial';
import * as migration_20261010_214517_office_workspace from './20261010_214517_office_workspace';

export const migrations = [
  {
    up: migration_20261010_120600_initial.up,
    down: migration_20261010_120600_initial.down,
    name: '20261010_120600_initial',
  },
  {
    up: migration_20261010_214517_office_workspace.up,
    down: migration_20261010_214517_office_workspace.down,
    name: '20261010_214517_office_workspace'
  },
];
