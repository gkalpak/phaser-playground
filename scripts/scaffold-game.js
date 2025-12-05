#!/bin/env node

// Imports
import {cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {normalize, relative, sep} from 'node:path';
import {argv, cwd, exit} from 'node:process';


// Constants
const CWD = cwd();
const ROOT_DIR = normalize(`${import.meta.dirname}/..`);

// Run
_main(argv.slice(2));

// Helpers
/**
 * @param {string[]} args
 * @returns {void}
 */
function _main(args) {
  try {
    // Check input.
    checkPrintUsage(args);
    validateInput(args);

    // Initialize variables.
    const [gameName, splashScreenColor, themeColor] = args;

    const gameDisplayName = gameName.
      replace(/^(.)/, (_m, g1) => g1.toUpperCase()).
      replace(/-(.)/g, (_m, g1) => ` ${g1.toUpperCase()}`);

    const appDir = `${ROOT_DIR}/app`;
    const srcDir = `${appDir}/projects/_template`;
    const dstDir = `${appDir}/projects/${gameName}`;
    const indexHtmlPath = `${appDir}/index.html`;

    // Validate directories.
    validateDirectories(srcDir, dstDir);

    //  Log debug info.
    logProjectInfo(gameName, gameDisplayName, splashScreenColor, themeColor, srcDir, dstDir);

    // Create project.
    console.log('');
    createRawProject(srcDir, dstDir);
    replacePlaceholders(dstDir, {
      GAME_DISPLAY_NAME: gameDisplayName,
      GAME_NAME: gameName,
      SPLASH_SCREEN_COLOR: splashScreenColor,
      THEME_COLOR: themeColor,
    });
    updateIndexHtml(indexHtmlPath, gameName, gameDisplayName);

    console.log('\nProject scaffolded successfully!');
  } catch (err) {
    console.error('\n');
    console.error(err);

    printUsageInfo();

    exit(1);
  }
}

/**
 * @param {string[]} args
 * @returns {void}
 */
function checkPrintUsage(args) {
  if (/^(?:-h|--help)$/.test(args.join(''))) {
    printUsageInfo();
    exit(0);
  }
}

/**
 *
 * @param {string} srcDir
 * @param {string} dstDir
 * @returns {void}
 */
function createRawProject(srcDir, dstDir) {
  cpSync(srcDir, dstDir, {recursive: true});

  console.log(`  ...Created new project at '${relativeDirStr(dstDir)}'.`);
}

/**
 * @param {string} gameName
 * @param {string} gameDisplayName
 * @param {string} splashScreenColor
 * @param {string} themeColor
 * @param {string} srcDir
 * @param {string} dstDir
 * @returns {void}
 */
function logProjectInfo(gameName, gameDisplayName, splashScreenColor, themeColor, srcDir, dstDir) {
  console.log('');
  console.log('Scaffolding new game project with the following info:');
  console.log(`  GAME NAME:             ${gameName}`);
  console.log(`  GAME DISPLAY NAME:     ${gameDisplayName}`);
  console.log(`  SPLASH-SCREEN COLOR:   ${splashScreenColor}`);
  console.log(`  THEME COLOR:           ${themeColor}`);
  console.log('');
  console.log(`  Template directory:    ${relativeDirStr(srcDir)}`);
  console.log(`  New project directory: ${relativeDirStr(dstDir)}`);
}

/**
 * @returns {void}
 */
function printUsageInfo() {
  console.log('\nUsage:');
  console.log(`  node ${relativePathStr(import.meta.filename)} <game-name> <splash-screen-color> <theme-color>`);
}

/**
 * @param {string} absoluteDir
 * @param {string} [referenceDir]
 * @returns {string}
 */
function relativeDirStr(absoluteDir, referenceDir = CWD) {
  return `${relativePathStr(absoluteDir, referenceDir)}/`;
}

/**
 * @param {string} absolutePath
 * @param {string} [referenceDir]
 * @returns {string}
 */
function relativePathStr(absolutePath, referenceDir = CWD) {
  return relative(referenceDir, absolutePath).replaceAll(sep, '/');
}

/**
 * @param {string} projectDir
 * @param {Record<string, string>} replacements
 * @returns {void}
 */
function replacePlaceholders(projectDir, replacements) {
  const projectFilePaths = readdirSync(projectDir, {recursive: true, withFileTypes: true}).
    filter(x => x.isFile()).
    map(x => `${x.parentPath}/${x.name}`);

  for (const filePath of projectFilePaths) {
    for (const [placeholder, replacement] of Object.entries(replacements)) {
      const oldContent = readFileSync(filePath, 'utf8');
      const newContent = oldContent.replaceAll(`{{${placeholder}}}`, replacement);
      writeFileSync(filePath, newContent);
    }
  }

  console.log(`  ...Replaced placeholders with provided values in '${relativeDirStr(projectDir)}'.`);
}

/**
 * @param {string} indexHtmlPath
 * @param {string} gameName
 * @param {string} gameDisplayName
 * @returns {void}
 */
function updateIndexHtml(indexHtmlPath, gameName, gameDisplayName) {
  const gameDisplayNameLower = gameDisplayName.toLowerCase();
  const newGameLocationMarkerRe = new RegExp('( *)<!-- ADD NEW GAMES HERE -->');
  const newGameHtml =
      '<p>\n' +
      `  <a class="project" href="projects/${gameName}/index.html">\n` +
      `    <img class="thumbnail" src="projects/${gameName}/assets/images/favicon.ico" alt="${gameDisplayNameLower} game logo" />\n` +
      `    ${gameDisplayName}\n` +
      '  </a>\n' +
      '</p>';

  const oldIndexHtmlContent = readFileSync(indexHtmlPath, 'utf8');
  const newIndexHtmlContent = oldIndexHtmlContent.
    replace(newGameLocationMarkerRe, (m, g1) => `${newGameHtml.split('\n').map(x => `${g1}${x}`).join('\n')}\n\n${m}`);
  writeFileSync(indexHtmlPath, newIndexHtmlContent);

  console.log(`  ...Updated project list in '${indexHtmlPath}'.`);
}

/**
 * @param {string} srcDir
 * @param {string} dstDir
 * @returns {void}
 */
function validateDirectories(srcDir, dstDir) {
  if (!existsSync(srcDir) || !statSync(srcDir).isDirectory()) {
    throw new Error(`Template directory (${srcDir}) does not exist or is not a directory.`);
  }

  if (existsSync(dstDir)) {
    throw new Error(`New project directory (${dstDir}) does already exist.`);
  }
}

/**
 * @param {string[]} args
 * @returns {void}
 */
function validateInput(args) {
  const gameNameRe = /^[a-z][-0-9a-z]*$/;
  const colorRe = /^(?:[a-z]+|#[0-9a-f]{6})$/;

  if (args.length !== 3) {
    throw new Error('Invalid number of arguments.');
  }

  if (!gameNameRe.test(args[0])) {
    throw new Error(`Invalid game name (expected: ${gameNameRe} | found: ${args[0]}).`);
  }

  if (!colorRe.test(args[1])) {
    throw new Error(`Invalid splash-screen color (expected: ${colorRe} | found: ${args[1]}).`);
  }

  if (!colorRe.test(args[2])) {
    throw new Error(`Invalid theme color (expected: ${colorRe} | found: ${args[2]}).`);
  }
}
