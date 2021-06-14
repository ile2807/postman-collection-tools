const { mergeVariablesToCollection, mergeVariablesToEnvironment } = require('./lib/variable-merger');
const requestMerge = require('./lib/request-merger');
const collectionMerge = require('./lib/collection-merger');
const { addTest200, addTestSmart, appendRequestHash } = require('./lib/test-appender')
const { exportDescriptionMD, exportDescriptionPDF } = require('./lib/exporter')
const { cleanRequests, cleanVariables } = require('./lib/cleanup')
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
            return cleanRequests(inputFileName, outputFileName);
        }
        case "clv": {
            return cleanVariables(inputFileName, outputFileName);
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
        case "arph": {
            return appendRequestHash(inputFileName, outputFileName);
        }
        case "emd": {
            return exportDescriptionMD(inputFileName, outputFileName);
        }
        case "epdf": {
            return exportDescriptionPDF(inputFileName, outputFileName);
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
exports.cleanRequests = cleanRequests;
exports.cleanVariables = cleanVariables;
exports.mergeVariables = mergeVariablesToCollection;
exports.mergeRequests = requestMerge;
exports.mergeCollections = collectionMerge;
exports.mergeVarsToEnvironment = mergeVariablesToEnvironment;
exports.appendMissingVariables = appendVariables;
exports.appendRequestHash = appendRequestHash;
exports.exportDescriptionMD = exportDescriptionMD;
exports.exportDescriptionPDF = exportDescriptionPDF;


