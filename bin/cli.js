#!/usr/bin/env node

const inquirer = require('inquirer');
const {extractCommits} = require('../lib/extractCommits');
const {getAuthors, isGitRepository, checkGitInstallation, checkNodeVersion} = require('../lib/utils');

async function main() {
  try {
    // Check Node.js version
    checkNodeVersion();

    // Check if Git is installed
    if (!checkGitInstallation()) {
      console.error('Git is not installed. Please install Git to use this tool.');
      process.exit(1);
    }

    let validRepo = false;
    let repoPath = '';

    while (!validRepo) {
      const {repoPathInput} = await inquirer.prompt({
        type: 'input',
        name: 'repoPathInput',
        message: 'Enter the path of the Git repository:',
        default: process.cwd()
      });

      if (isGitRepository(repoPathInput)) {
        validRepo = true;
        repoPath = repoPathInput;
      } else {
        console.log('❌ No Git repository found at the specified path. Please try again.');
      }
    }

    const authors = await getAuthors(repoPath);
    const questions = [
      {
        type: 'list',
        name: 'author',
        message: 'Select the author of the commits:',
        choices: authors
      },
      {
        type: 'input',
        name: 'githubName',
        message: 'Enter your GitHub name:',
      },
      {
        type: 'input',
        name: 'githubEmail',
        message: 'Enter your GitHub email:',
      },
      {
        type: 'input',
        name: 'outputPath',
        message: 'Enter the path where you want to create the new repository:',
        default: './output'
      },
      {
        type: 'input',
        name: 'fileName',
        message: 'Enter the name of the single file:',
        default: 'file.txt'
      }
    ];

    const answers = await inquirer.prompt(questions);
    await extractCommits(answers.author, repoPath, answers.outputPath, answers.fileName, answers.githubName, answers.githubEmail);
  } catch (error) {
    console.error(`Error: ${ error.message }`);
  }
}

main();
