const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const { help, line } = require('./lib/helper');
const { validateParametersSourceFile, validateParametersSourceFolder } = require('./lib/validation');
const variableMerge = require('./lib/variable-merger');
const requestMerge = require('./lib/request-merger');
const collectionMerge = require('./lib/collection-merger');
const { addTest200, addTestSmart } = require('./lib/test-appender')
const { cleanup } = require('./lib/cleanup')
const targetCollectionName = args.o;
const collectionsFolder = args.f;
const command = process.argv.slice(2)[0];
var sourceCollectionName = args.s;
var sourceFileContent = '{"_": {"postman_id": "8dd63cc7-61b4-4743-b7b2-bf95f661324a"},"item": []}';

clear();

console.log(
    chalk.yellow(
        figlet.textSync('Jackal', { horizontalLayout: 'full' })
    )
);
if (args.h) {
    help();
}

if (command===undefined) help();

if (command.startsWith("t") || command.startsWith("clr")) {
    validateParametersSourceFile(sourceCollectionName, targetCollectionName);
} else if (command.startsWith("merge")) {
    validateParametersSourceFolder(collectionsFolder, targetCollectionName);
}

if (sourceCollectionName != undefined) {
    sourceFileContent = fs.readFileSync(sourceCollectionName).toString();
} else {
    sourceCollectionName = "Blank collection"
}

console.log('Source collections folder > ' + chalk.cyan(collectionsFolder));
console.log('Start collection > ' + chalk.cyan(sourceCollectionName));
console.log('Target collection > ' + chalk.cyan(targetCollectionName));
console.log('Command > ' + chalk.cyan(command))
line();

switch (command) {

    case "ts": {
        addTestSmart(sourceCollectionName, targetCollectionName);
        break;
    }
    case "t200": {
        addTest200(sourceCollectionName, targetCollectionName);
        break;
    }
    case "clr": {
        cleanup(sourceCollectionName, targetCollectionName);
        break;
    }
    case "mv": {
        variableMerge(sourceFileContent, collectionsFolder, targetCollectionName);
        break;
    }
    case "mr": {
        requestMerge(sourceFileContent, collectionsFolder, targetCollectionName);
        break;
    }
    case "mc": {
        collectionMerge(sourceFileContent, collectionsFolder, targetCollectionName);
        break;
    }
    default: {
        console.log('Command > ' + chalk.magenta(command) + ' not recognized, please use -h to see more info on possible commands');
        line();
        break;
    }
}



