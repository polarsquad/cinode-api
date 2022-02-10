import 'mocha';
import { StatsStorage } from '../../stats/storage';
import {
  CustomerStats,
  ProjectStats,
  SkillStats,
  UserStats,
} from '../../stats/types';

// Skipped because requires real google sheet to operate, but
// can be used to test the StatsStorage
describe.skip('StatsStorage', () => {
  it.skip('creates the tables to the sheet', async () => {
    const storage = new StatsStorage(
      'some-google-sheet-id',
      process.env['GOOGLE_CLIENT_EMAIL'],
      process.env['GOOGLE_CLIENT_PRIVATE_KEY']
    );

    await storage.createTables([
      new ProjectStats(),
      new CustomerStats(),
      new UserStats(),
      new SkillStats(),
    ]);
  }).timeout(10000);

  it('should store data to the sheet and get back the latest', async () => {
    const storage = new StatsStorage(
      'some-google-sheet-id',
      process.env['GOOGLE_CLIENT_EMAIL'],
      process.env['GOOGLE_CLIENT_PRIVATE_KEY']
    );

    const stats = new ProjectStats();
    stats.hasTags = 4;
    stats.hasSalesManagers = 2;
    stats.totalNumberOfProjects = 123;

    await storage.storeStats(stats);
  }).timeout(5000);
});
