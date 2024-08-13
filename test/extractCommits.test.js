const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

// Mocking execSync and spawnSync in the test file
jest.mock('child_process', () => ({
  execSync: jest.fn((cmd) => {
    if (cmd.includes('log')) {
      return '2022-01-01T00:00:00Z\n2022-01-02T00:00:00Z';
    } else if (cmd.includes('rev-parse')) {
      if (cmd.includes('/invalid/path')) {
        throw new Error('not a git repository');
      }
      return true;
    } else if (cmd.includes('git --version')) {
      return 'git version 2.30.0';
    }
    return '';
  }),
  spawnSync: jest.fn((cmd, args) => {
    return { status: 0 };  // Simulate successful command execution
  })
}));

const { extractCommits } = require('../lib/extractCommits');
const { isGitRepository, checkGitInstallation, checkNodeVersion, showBanner } = require('../lib/utils');

describe('extractCommits', () => {
  const author = 'Author1';
  const repoPath = '.';
  const outputPath = './output';
  const fileName = 'file.txt';
  const githubName = 'GitHubUser';
  const githubEmail = 'user@github.com';

  beforeEach(() => {
    if (fs.existsSync(outputPath)) {
      fs.rmdirSync(outputPath, { recursive: true });
    }
  });

  test('extracts commits and creates new repository', async () => {
    await extractCommits(author, repoPath, outputPath, fileName, githubName, githubEmail);

    expect(fs.existsSync(outputPath)).toBe(true);
    expect(fs.existsSync(path.join(outputPath, fileName))).toBe(true);
    // Further checks can be added to verify commit history, etc.
  });

  test('checks if a directory is a git repository', () => {
    expect(isGitRepository(repoPath)).toBe(true);
    expect(isGitRepository('/invalid/path')).toBe(false);
  });

  test('checks if Git is installed', () => {
    expect(checkGitInstallation()).toBe(true);
  });

  test('checks Node.js version', () => {
    expect(() => checkNodeVersion()).not.toThrow();
  });
});
