import { expect } from 'chai';
import 'mocha';
import { HasProject, ProjectAssignmentBase } from '../src/types';

import {
  buildProjectUrlFromAssignment,
  getImageUrl,
  isProjectUrl,
  parseProjectUrl,
} from '../src/urls';

import { project, assignment, company } from './test-builder';

describe('cinode utils', () => {
  const TEST_COMPANY_NAME = 'foobarbaz';

  context('buildProjectUrlFromAssignment', () => {
    it('return spaces as dashes', () => {
      expect(
        buildProjectUrlFromAssignment(
          company({ name: TEST_COMPANY_NAME }),
          assignment({
            project: project({ id: 123, title: 'foo bar' }),
          }) as ProjectAssignmentBase & HasProject
        )
      ).to.equal(
        `https://app.cinode.com/${TEST_COMPANY_NAME}/projects/123/foo-bar`
      );
    });

    it('should trim extra spaces', () => {
      expect(
        buildProjectUrlFromAssignment(
          company({ name: TEST_COMPANY_NAME }),
          assignment({
            project: { id: 123, title: 'foo        bar' },
          }) as ProjectAssignmentBase & HasProject
        )
      ).to.equal(
        `https://app.cinode.com/${TEST_COMPANY_NAME}/projects/123/foo-bar`
      );
    });

    it('return äö as ao', () => {
      expect(
        buildProjectUrlFromAssignment(
          company({ name: TEST_COMPANY_NAME }),
          assignment({
            project: { id: 123, title: 'föö bär' },
          }) as ProjectAssignmentBase & HasProject
        )
      ).to.equal(
        `https://app.cinode.com/${TEST_COMPANY_NAME}/projects/123/foo-bar`
      );
    });
  });

  context('isProjectUrl', () => {
    it('should identify project url', () => {
      expect(
        isProjectUrl(
          `https://app.cinode.com/${TEST_COMPANY_NAME}/projects/89399/aws-expert`
        )
      ).to.eql(true);
    });

    it('should not mess up with customer url', () => {
      expect(
        isProjectUrl(
          `https://app.cinode.com/${TEST_COMPANY_NAME}/customers/58712/58712-unknown`
        )
      ).to.eql(false);
    });
  });

  context('parseProjectUrl', () => {
    it('should parse project id', () => {
      expect(
        parseProjectUrl(
          `https://app.cinode.com/${TEST_COMPANY_NAME}/projects/88523/Containers-and-Docker-basics-workshops`
        )
      ).to.eql(88523);
      expect(
        parseProjectUrl(
          `https://app.cinode.com/${TEST_COMPANY_NAME}/projects/89399/aws-expert`
        )
      ).to.eql(89399);
    });
  });

  context('getImageUrl', () => {
    it('should build image url', () => {
      expect(
        getImageUrl({
          id: 63823,
          companyId: 1234,
          imageFileName: '9c73fe2f-933b-484b-a7c6-f7681165f623',
          extension: 'jpeg',
        })
      ).to.eql(
        'https://p.cinodestatic.net/_images/1234/9c/73/9c73fe2f-933b-484b-a7c6-f7681165f623_200_200.jpeg'
      );
    });
  });
});
