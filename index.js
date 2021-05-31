const { mergeVariablesToCollection, mergeVariablesToEnvironment } = require('./lib/variable-merger');
const requestMerge = require('./lib/request-merger');
const collectionMerge = require('./lib/collection-merger');
const { addTest200, addTestSmart } = require('./lib/test-appender')
const { cleanup } = require('./lib/cleanup')
const { appendVariables } = require('./lib/collection-missing-variable-appender')

const executeCommand = async (command, sourceFileName, collectionsFolder, outputFileName, collections) => {

    switch (command) {
        case "ts": {
            return addTestSmart(sourceFileName, outputFileName);
        }
        case "t200": {
            return addTest200(sourceFileName, outputFileName);
        }
        case "clr": {
            return cleanup(sourceFileName, outputFileName);
        }
        case "mv": {
            return mergeVariablesToCollection(sourceFileName, collectionsFolder, outputFileName, collections);
        }
        case "mr": {
            return requestMerge(sourceFileName, collectionsFolder, outputFileName, collections);
        }
        case "mc": {
            return collectionMerge(sourceFileName, collectionsFolder, outputFileName, collections);
        }
        case "amcv": {
            return appendVariables(sourceFileName, outputFileName);
        }
        case "mev": {
            return mergeVariablesToEnvironment(sourceFileName, collectionsFolder, outputFileName, collections);
        }
        default: {
            return "Command not found";
        }
    }
}

exports.run = executeCommand;