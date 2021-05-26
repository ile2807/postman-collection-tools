const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const clear = require('clear');
const { help, line, version } = require('./lib/helper');
const { validateParametersSourceFile, validateParametersSourceFolder, validateSourceFile } = require('./lib/validation');
const { mergeVariablesToCollection, mergeVariablesToEnvironment } = require('./lib/variable-merger');
const requestMerge = require('./lib/request-merger');
const collectionMerge = require('./lib/collection-merger');
const { addTest200, addTestSmart } = require('./lib/test-appender')
const { cleanup } = require('./lib/cleanup')
const { appendVariables } = require('./lib/collection-missing-variable-appender')
const outputFileName = args.o;
const collectionsFolder = args.f;
const command = process.argv.slice(2)[0];
var sourceFileName = args.s;
const emptyCollectionContent = '{"_": {"postman_id": "8dd63cc7-61b4-4743-b7b2-bf95f661324a"},"item": []}';
const emptyEnvironmentContent = '{"id": "fdb3a494-46a0-40eb-ab98-a67a3cc3a05d","name": "New Environment","values": [],"_postman_variable_scope": "environment","_postman_exported_at": "2021-05-24T21:47:26.905Z","_postman_exported_using": "Postman/8.5.0"}';
var sourceFileContent;

clear();

if (args.v || args.version) {
    version();
}

if (args.h || args.help) {
    help();
}

if (command === undefined) help();

if (command.startsWith("t") || command.startsWith("clr") || command.startsWith("amcv")) {
    validateParametersSourceFile(sourceFileName, outputFileName);
} else if (command.startsWith("m")) {
    validateParametersSourceFolder(collectionsFolder, outputFileName);
}

if (sourceFileName != undefined && validateSourceFile(sourceFileName)) {
    sourceFileContent = fs.readFileSync(sourceFileName).toString();
} else {
    if (command === "mv") {
        sourceFileName = "Blank collection";
        sourceFileContent = emptyCollectionContent;
    } else {
        sourceFileName = "Blank environment";
        sourceFileContent = emptyEnvironmentContent;
    }
}

console.log('Source collections folder > ' + chalk.cyan(collectionsFolder));
console.log('Start collection > ' + chalk.cyan(sourceFileName));
console.log('Target collection > ' + chalk.cyan(outputFileName));
console.log('Command > ' + chalk.cyan(command))
line();

switch (command) {

    case "ts": {
        addTestSmart(sourceFileName, outputFileName);
        break;
    }
    case "t200": {
        addTest200(sourceFileName, outputFileName);
        break;
    }
    case "clr": {
        cleanup(sourceFileName, outputFileName);
        break;
    }
    case "mv": {
        mergeVariablesToCollection(sourceFileContent, collectionsFolder, outputFileName);
        break;
    }
    case "mr": {
        requestMerge(sourceFileContent, collectionsFolder, outputFileName);
        break;
    }
    case "mc": {
        collectionMerge(sourceFileContent, collectionsFolder, outputFileName);
        break;
    }
    case "amcv": {
        appendVariables(sourceFileName, outputFileName);
        break;
    }
    case "mev": {
        mergeVariablesToEnvironment(sourceFileContent, collectionsFolder, outputFileName);
        break;
    }
    default: {
        console.log('Command > ' + chalk.magenta(command) + ' not recognized, please use -h to see more info on possible commands');
        line();
        break;
    }
}



