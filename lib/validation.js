const chalk = require('chalk');
const { exit } = require('process');
const { line } = require('./helper');

const validateParametersMergning = (collectionsFolder, targetCollectionName) => {
    if (collectionsFolder == undefined) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("You must provide source folder with existing collections, use the -f option followed by the source folder path, or -h to see help");
        line();
        exit();
    }
    if (targetCollectionName == undefined) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("You must provide target file, use -o option followed by the output file path, or -h to see help");
        line();
        exit();
    }
}

const validateParametersTesting = (sourceCollectionName, targetCollectionName) => {
    if (sourceCollectionName == undefined) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("You must provide source collection, use the -s option followed by the source folder path, or -h to see help");
        line();
        exit();
    }
    if (targetCollectionName == undefined) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("You must provide target file, use -o option followed by the output file path, or -h to see help");
        line();
        exit();
    }
}


validateParametersTesting

module.exports = {
    validateParametersMerging: validateParametersMergning,
    validateParametersTesting: validateParametersTesting
}