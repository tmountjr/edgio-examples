const { execSync } = require('child_process');
const chalk = require('chalk');
const prompts = require('prompts');
const fs = require('fs');
const path = require('path');
const os = require('os');

const examplesPath = path.join(process.cwd(), 'examples');
const templateName = '_template';

async function main() {
  console.clear();

  // Check if `edgio` CLI is installed globally
  try {
    execSync('edgio --version', { stdio: 'ignore' });
  } catch (err) {
    console.error(
      chalk.red(
        '❌ Edgio CLI is not installed. Please install it using `npm i -g @edgio/cli`.'
      )
    );
    return;
  }

  // Prompt the user to prepare a new or existing example
  console.log(
    `${chalk.cyan('Welcome to Edgio Examples')}\n`,
    'You may prepare a new example based on a starter template or work on an existing one.\n',
    'Preparing an example for use will automatically install the necessary dependencies.\n\n'
  );
  const { exampleType } = await prompts({
    type: 'select',
    name: 'exampleType',
    message: 'Would you like to prepare a new or existing example?',
    choices: [
      { title: 'New - Creates a new repo from base template', value: 'new' },
      {
        title: 'Existing - Prepares example by installing modules',
        value: 'existing',
      },
      { title: 'Import - Import from a GitHub URL', value: 'import' },
      {
        title: 'Update - Adds Edgio scripts to existing example',
        value: 'update',
      },
    ],
  });

  let exampleName;
  let examplePath;
  const formatFn = (input) => input.trim();

  // new or github import
  if (['new', 'import'].includes(exampleType)) {
    // Prompt the user to enter the name of the new example
    const { name } = await prompts({
      type: 'text',
      name: 'name',
      message: 'Enter the name of the new example:',
      initial: 'eg. `vue3` (not `edgio-vue3-example`)',
      format: formatFn,
      validate: (input) => {
        const name = formatFn(input);
        const newExamplePath = path.join(examplesPath, name);
        if (fs.existsSync(newExamplePath)) {
          return `Example "${name}" already exists, please use different name`;
        }
        return true;
      },
    });

    exampleName = name;
    examplePath = path.join(examplesPath, exampleName);

    if (exampleType === 'new') {
      await copyTemplate(examplePath);
    } else if (exampleType === 'import') {
      const { importUrl } = await prompts({
        type: 'text',
        name: 'importUrl',
        message: 'Enter the Github URL of the example to import:',
        initial: 'eg. `git@github.com:edgio-docs/my-example.git`',
      });

      await cloneRepo(importUrl, examplePath);
    }

    // Update package.json name/repo
    const packageJsonPath = path.join(examplePath, 'package.json');
    fs.readFile(packageJsonPath, 'utf8', async (err, data) => {
      if (err) throw err;

      const pkgProps = getNameAndRepoUrl(exampleName);
      const packageJson = JSON.parse(data);
      packageJson.repository = pkgProps.repository;
      packageJson.name = pkgProps.name;

      try {
        fs.writeFile(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2),
          (err) => {
            if (err) throw err;
          }
        );
      } catch (err) {
        console.error(`Error: ${err}`);
      }
    });

    console.log(chalk.green(`✔ Created new example "${exampleName}"`));

    // Install the packages and the latest Edgio version
    console.log('Installing packages and updating to latest Edgio version...');
    await installDependencies(examplePath);
    await updateEdgio(examplePath);
  } else {
    // Show a list of examples to choose from by listing the directory names within the `examples` directory
    const examples = fs
      .readdirSync(examplesPath)
      .sort()
      .filter((name) => name !== templateName);
    const { example } = await prompts({
      type: 'autocomplete',
      name: 'example',
      message: 'Select existing example (type to filter):',
      clearFirst: true,
      instructions: false,
      choices: examples.map((name) => ({ title: name, value: name })),
      suggest: (input, choices) =>
        choices.filter((choice) => choice.title.includes(input)),
    });

    if (!example) {
      console.log(chalk.yellow('No example selected, exiting...'));
      return;
    }
    exampleName = example;
    examplePath = path.join(examplesPath, exampleName);

    if (exampleType === 'update') {
      // copy over the .github folder and update package.json
      await copyGithubFiles(examplePath);
      await mergePackageJsons(
        path.join(examplePath, 'package.json'),
        getNameAndRepoUrl(exampleName)
      );
    }

    // Install the packages
    await installDependencies(examplePath);
  }

  // Inform the user that the example is ready to be worked on
  const cdCmd = `cd ${path.relative(process.cwd(), examplePath)}`;
  const shortcutKey = os.platform() === 'darwin' ? '\u2318' : 'Control';

  const { default: clipboardy } = await import('clipboardy');
  clipboardy.writeSync(cdCmd);

  console.log(
    chalk.green(`✔ ${exampleName} is ready to be worked on.`),
    '\n\n',
    `To switch to the example, press ${chalk.cyan(
      `${shortcutKey} + V`
    )} or run: ${chalk.cyan(cdCmd)}\n\n`
  );
}

async function installDependencies(examplePath) {
  // Run `npm install` or `yarn install` within the chosen directory
  console.log('Installing packages...');
  const yarnLockFilePath = path.join(examplePath, 'yarn.lock');
  if (fs.existsSync(yarnLockFilePath)) {
    // Run `yarn install` within the chosen directory
    execSync(`cd ${examplePath} && yarn install`);
  } else {
    // Run `npm install` within the chosen directory
    execSync(`cd ${examplePath} && npm install`);
  }
}

async function updateEdgio(examplePath) {
  execSync(`cd ${examplePath} && edgio use latest`);
}

async function cloneRepo(repoUrl, examplePath) {
  execSync(`git clone ${repoUrl} ${examplePath}`);

  // Remove .git folder
  execSync(`rm -rf ${path.join(examplePath, '.git')}`);
}

async function copyTemplate(examplePath) {
  // Copy the contents of the `_template` directory into the new directory
  execSync(`cp -r _template ${examplesPath}`);

  // Rename the directory to the name of the new example
  fs.renameSync(path.join(examplesPath, '_template'), examplePath);
}

async function copyGithubFiles(examplePath) {
  // Copy the .github folder from the template
  execSync(
    `cp -r ${path.join(examplesPath, templateName, '.github')} ${examplePath}`
  );
}

async function mergePackageJsons(targetPath, options = {}) {
  try {
    const targetJson = fs.readFileSync(targetPath, 'utf8');
    const sourceJson = fs.readFileSync(
      path.join(process.cwd(), templateName, 'package.json'),
      'utf8'
    );

    const targetObj = JSON.parse(targetJson);
    const sourceObj = JSON.parse(sourceJson);

    const mergedObj = deepMerge(targetObj, { ...sourceObj, ...options });

    fs.writeFileSync(targetPath, JSON.stringify(mergedObj, null, 2));
  } catch (err) {
    console.error(`Error merging package.json files: ${err}`);
  }
}

function deepMerge(target, source) {
  for (const key in source) {
    if (
      source[key] instanceof Object &&
      target.hasOwnProperty(key) &&
      target[key] instanceof Object
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function getNameAndRepoUrl(exampleName) {
  return {
    name: `edgio-${exampleName}-example`,
    repository: `git@github.com:edgio-docs/edgio-${exampleName}-example.git`,
  };
}

main();
