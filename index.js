const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const { help, line } = require('./lib/helper');
const validateParameters = require('./lib/validation');
const variableMerge = require('./lib/variable-merger');
const requestMerge = require('./lib/request-merger');
const collectionMerge = require('./lib/collection-merger');
const targetCollectionName = args.o;
const collectionsFolder = args.f;
const mode = args.m;
var sourceCollectionName = args.s;

clear();
console.log(
    chalk.yellow(
        figlet.textSync('Jackal', { horizontalLayout: 'full' })
    )
);
if (args.h) {
    help();
}

validateParameters(collectionsFolder, targetCollectionName);
var sourceFileContent = '{"_": {"postman_id": "8dd63cc7-61b4-4743-b7b2-bf95f661324a"},"item": []}';
if (sourceCollectionName != undefined) {
    sourceFileContent = fs.readFileSync(sourceCollectionName).toString();
}else{
    sourceCollectionName = "Blank collection"
}

console.log('Source collections folder > ' + chalk.cyan(collectionsFolder));
console.log('Start collection > ' + chalk.cyan(sourceCollectionName));
console.log('Target collection > ' + chalk.cyan(targetCollectionName));
console.log('Mode > ' + chalk.cyan(mode))
line();

switch (mode) {
    case "merge-variables": {
        variableMerge(sourceFileContent, collectionsFolder, targetCollectionName);
        break;
    }
    case "merge-requests": {
        requestMerge(sourceFileContent, collectionsFolder, targetCollectionName);
        break;
    }
    case "merge-collections": {
        collectionMerge(sourceFileContent, collectionsFolder, targetCollectionName);
        break;
    }
    default:{
        console.log('Mode > ' + chalk.magenta(mode) + ' not recognized, please use -h to see more info on possible modes');
        line();
        break;
    }
}



