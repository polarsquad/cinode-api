import { expect } from 'chai';
import 'mocha';
import { ProjectStats } from '../../stats/types';

describe('stats types', () => {
  context('ProjectStats', () => {
    it('should return class fields as column names', () => {
      expect(new ProjectStats().columnNames).is.eql([
        'timestamp',
        'hasTags',
        'activeProjectsHasTags',
        'hasSalesManagers',
        'activeProjectsHasSalesManagers',
        'totalNumberOfProjects',
        'totalNumberOfActiveProjects',
      ]);
    });

    it('should return table name', () => {
      expect(new ProjectStats().tableName).is.eql('ProjectStats');
    });
  });
});
