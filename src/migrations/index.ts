import * as migration_20261010_120600_initial from './20261010_120600_initial';
import * as migration_20261010_214517_office_workspace from './20261010_214517_office_workspace';
import * as migration_20261010_221939_staff_password from './20261010_221939_staff_password';
import * as migration_20261010_233714_google_analytics from './20261010_233714_google_analytics';
import * as migration_20261011_152503_analytics_audience from './20261011_152503_analytics_audience';

export const migrations = [
  {
    up: migration_20261010_120600_initial.up,
    down: migration_20261010_120600_initial.down,
    name: '20261010_120600_initial',
  },
  {
    up: migration_20261010_214517_office_workspace.up,
    down: migration_20261010_214517_office_workspace.down,
    name: '20261010_214517_office_workspace',
  },
  {
    up: migration_20261010_221939_staff_password.up,
    down: migration_20261010_221939_staff_password.down,
    name: '20261010_221939_staff_password',
  },
  {
    up: migration_20261010_233714_google_analytics.up,
    down: migration_20261010_233714_google_analytics.down,
    name: '20261010_233714_google_analytics',
  },
  {
    up: migration_20261011_152503_analytics_audience.up,
    down: migration_20261011_152503_analytics_audience.down,
    name: '20261011_152503_analytics_audience'
  },
];
