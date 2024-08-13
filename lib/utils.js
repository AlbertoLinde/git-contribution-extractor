const {execSync} = require('child_process');

function getAuthors(repoPath = process.cwd()) {
  const gitLogCommand = `git -C ${ repoPath } log --pretty=format:"%an"`;
  const log = execSync(gitLogCommand).toString();
  return [...new Set(log.split('\n'))];
}

function isGitRepository(repoPath) {
  try {
    execSync(`git -C ${ repoPath } rev-parse --is-inside-work-tree`, {stdio: 'ignore'});
    return true;
  } catch (error) {
    return false;
  }
}

function checkGitInstallation() {
  try {
    execSync('git --version', {stdio: 'ignore'});
    return true;
  } catch (error) {
    return false;
  }
}

function checkNodeVersion() {
  const REQUIRED_VERSION = '12.0.0';
  const nodeVersion = process.version.replace('v', '');
  if (nodeVersion < REQUIRED_VERSION) {
    console.error(`❌ Node.js version ${ REQUIRED_VERSION } or higher is required. You are using version ${ nodeVersion }.`);
    process.exit(1);
  } else {
    console.log(`✅ Node.js version ${ nodeVersion } is compatible. 🎉`);
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${ year }${ month }${ day }_${ hours }${ minutes }${ seconds }`;
}

module.exports = {getAuthors, isGitRepository, checkGitInstallation, checkNodeVersion, formatDate};
