const chalk = require('chalk');
const { exit } = require('process');
const { line } = require('./helper');
const fs = require('fs');

const validateParametersSourceFolder = (sourceFolder, outputFileName) => 
validateSourceFolder(sourceFolder) && validateOutputFile(outputFileName);

const validateParametersSourceFile = (sourceFileName, outputFileName) => 
validateSourceFile(sourceFileName) && validateOutputFile(outputFileName);

const validateSourceFolder = sourceFolder => {
    if (sourceFolder == undefined) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("You must provide source folder with existing collections, use the -f option followed by the source folder path, or -h to see help");
        line();
        exit();
    }
    if (!checkIfFolderExists(sourceFolder)) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("The specified source folder does not exist or is not a folder, use -h to see help");
        line();
        exit();
    }
}

const validateOutputFile = outputFileName => {
    if (outputFileName == undefined) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("You must provide target file, use -o option followed by the output file path, or -h to see help");
        line();
        exit();
    }
}

const validateSourceFile = sourceFileName => {
    console.log(sourceFileName);
    if (sourceFileName == undefined) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("You must provide source file, use the -s option followed by the source folder path, or -h to see help");
        line();
        exit();
    }
    if (!checkIfFileExists(sourceFileName)) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("The specified source file does not exist or is not a file, use -h to see help");
        line();
        exit();
    }
}


const checkIfFileExists = sourceFileName => fs.existsSync(sourceFileName) && fs.lstatSync(sourceFileName).isFile();
const checkIfFolderExists = sourceFolder => fs.existsSync(sourceFolder) && fs.lstatSync(sourceFolder).isDirectory();

module.exports = {
    validateParametersSourceFolder: validateParametersSourceFolder,
    validateParametersSourceFile: validateParametersSourceFile,
    validateSourceFile: validateSourceFile
}