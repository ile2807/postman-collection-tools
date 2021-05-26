const fs = require('fs');
const { mergeVariablesToCollection, mergeVariablesToEnvironment } = require('./lib/variable-merger');
const requestMerge = require('./lib/request-merger');
const collectionMerge = require('./lib/collection-merger');
const { addTest200, addTestSmart } = require('./lib/test-appender')
const { cleanup } = require('./lib/cleanup')
const { appendVariables } = require('./lib/collection-missing-variable-appender')
const emptyCollectionContent = '{"_": {"postman_id": "8dd63cc7-61b4-4743-b7b2-bf95f661324a"},"item": []}';
const emptyEnvironmentContent = '{"id": "fdb3a494-46a0-40eb-ab98-a67a3cc3a05d","name": "New Environment","values": [],"_postman_variable_scope": "environment","_postman_exported_at": "2021-05-24T21:47:26.905Z","_postman_exported_using": "Postman/8.5.0"}';
var sourceFileContent;

const executeCommand = (command, sourceFileName, collectionsFolder, outputFileName) => {
    if (sourceFileName != undefined) {
        sourceFileContent = fs.readFileSync(sourceFileName).toString();
    } else {
        if (command === "mev") {
            sourceFileName = "Blank environment";
            sourceFileContent = emptyEnvironmentContent;
        } else {
            sourceFileName = "Blank collection";
            sourceFileContent = emptyCollectionContent;
        }
    }

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
           return mergeVariablesToCollection(sourceFileName, collectionsFolder, outputFileName);
        }
        case "mr": {
            return requestMerge(sourceFileName, collectionsFolder, outputFileName);
        }
        case "mc": {
            return collectionMerge(sourceFileName, collectionsFolder, outputFileName);
        }
        case "amcv": {
            return appendVariables(sourceFileName, outputFileName);
        }
        case "mev": {
            return mergeVariablesToEnvironment(sourceFileName, collectionsFolder, outputFileName);
        }
        default: {
            return "Command not found";
        }
    }
}

exports.run = (command, sourceFileName, sourceFolder, outputFileName) => executeCommand(command, sourceFileName, sourceFolder, outputFileName);