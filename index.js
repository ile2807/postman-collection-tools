const { mergeVariablesToCollection, mergeVariablesToEnvironment } = require('./lib/variable-merger');
const requestMerge = require('./lib/request-merger');
const collectionMerge = require('./lib/collection-merger');
const { addTest200, addTestSmart } = require('./lib/test-appender')
const { cleanup } = require('./lib/cleanup')
const { appendVariables } = require('./lib/collection-missing-variable-appender');

const executeCommand = async (command, inputFileName, collectionsFolder, outputFileName, collections) => {

    switch (command) {
        case "ts": {
            return addTestSmart(inputFileName, outputFileName);
        }
        case "t200": {
            return addTest200(inputFileName, outputFileName);
        }
        case "clr": {
            return cleanup(inputFileName, outputFileName);
        }
        case "mv": {
            return mergeVariablesToCollection(inputFileName, collectionsFolder, outputFileName, collections);
        }
        case "mr": {
            return requestMerge(inputFileName, collectionsFolder, outputFileName, collections);
        }
        case "mc": {
            return collectionMerge(inputFileName, collectionsFolder, outputFileName, collections);
        }
        case "amcv": {
            return appendVariables(inputFileName, outputFileName);
        }
        case "mev": {
            return mergeVariablesToEnvironment(inputFileName, collectionsFolder, outputFileName, collections);
        }
        default: {
            return "Command not found";
        }
    }
}

exports.run = executeCommand;
exports.testsSmart = addTestSmart;
exports.tests200 = addTest200;
exports.cleanRequests = cleanup;
exports.mergeVariables = mergeVariablesToCollection;
exports.mergeRequests = requestMerge;
exports.mergeCollections = collectionMerge;
exports.mergeVarsToEnvironment = mergeVariablesToEnvironment;
exports.appendMissingVariables = appendVariables;

