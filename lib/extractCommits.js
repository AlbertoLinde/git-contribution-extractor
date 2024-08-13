const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const {execSync, spawnSync} = require('child_process');
const {formatDate} = require("./utils");

function printProgress(current, total) {
  const percentage = ((current / total) * 100).toFixed(2);
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Progress: ${ percentage }%`);
}

async function extractCommits(author, repoPath, outputPath, fileName, githubName, githubEmail) {
  const gitLogCommand = `git -C ${ repoPath } log --author="${ author }" --pretty=format:"%H %ad" --date=iso`;
  const log = execSync(gitLogCommand).toString().trim().split('\n');
  const totalCommits = log.length;

  if (fs.existsSync(outputPath)) {
    execSync(`rm -rf ${ outputPath }`);
  }
  fs.mkdirSync(outputPath, {recursive: true});

  execSync(`git init ${ outputPath }`);
  execSync(`git -C ${ outputPath } config user.name "${ githubName }"`);
  execSync(`git -C ${ outputPath } config user.email "${ githubEmail }"`);

  const branchName = `commits_${ formatDate(new Date()) }`;
  execSync(`git -C ${ outputPath } checkout -b ${ branchName }`);

  const filePath = path.join(outputPath, fileName);

  fs.writeFileSync(filePath, "Initial content\n");
  execSync(`git -C ${ outputPath } add ${ fileName }`);
  execSync(`git -C ${ outputPath } commit -m "Initial commit"`);

  log.forEach((line, index) => {
    const [commitHash, date] = line.split(' ', 2);
    fs.appendFileSync(filePath, `Commit ${ index + 1 }\n`);

    const addCommand = `git -C ${ outputPath } add ${ fileName }`;
    const commitMessage = `Fake commit ${ index + 1 }`;
    const commitCommand = `GIT_COMMITTER_NAME="${ githubName }" GIT_COMMITTER_EMAIL="${ githubEmail }" git -C ${ outputPath } commit --author="${ githubName } <${ githubEmail }>" --date="${ date }" -m "${ commitMessage }"`;

    if (typeof spawnSync === 'function') {
      spawnSync('sh', ['-c', `${ addCommand } && ${ commitCommand }`]);
    } else {
      throw new Error('spawnSync is not a function');
    }

    printProgress(index + 1, totalCommits);
  });

  printProgress(totalCommits, totalCommits);
  process.stdout.write('\n');

  console.log(`✅ New repository with commits from ${ author } has been created at ${ outputPath } in branch ${ branchName }`);
  console.log(chalk.yellow(`
      ⚠️  Remember: If you are doing this from a repository with existing commits for this Repository, delete the created file '${ fileName }' to avoid duplicate commits.
    `));
}

module.exports = {extractCommits};
