const chalk = require('chalk');
const { exit } = require('process');
const { line } = require('./helper');

const validateParameters = (collectionsFolder, targetCollectionName) => {
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

module.exports = validateParameters;