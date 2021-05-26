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
            break;
        }
    }
}

module.execute = executeCommand;