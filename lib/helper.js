const fs = require('fs');
const stripJSONComments = require('strip-json-comments');
const emptyCollectionContent = '{"_": {"postman_id": "8dd63cc7-61b4-4743-b7b2-bf95f661324a"},"item": []}';
const emptyEnvironmentContent = '{"id": "fdb3a494-46a0-40eb-ab98-a67a3cc3a05d","name": "New Environment","values": [],"_postman_variable_scope": "environment","_postman_exported_at": "2021-05-24T21:47:26.905Z","_postman_exported_using": "Postman/8.5.0"}';

const saveCollection = (collection, outputFileName) => {
    let data = JSON.stringify(collection.toJSON(), null, "\t");
    //Writing the data
    fs.writeFileSync(outputFileName, data);
    return "OK";
}
const saveEnvironment = (collection, outputFileName) => {
    let data = JSON.stringify(collection, null, "\t");
    //Writing the data
    fs.writeFileSync(outputFileName, data);
    return "OK";
}

const readCollection = collectionFileName => {
    if (collectionFileName != undefined) {
        return JSON.parse(stripJSONComments(fs.readFileSync(collectionFileName).toString()));
    } else {
        return JSON.parse(emptyCollectionContent);
    }
}

const readEnvironment = environmentFileName => {
    if (environmentFileName != undefined) {
        return JSON.parse(stripJSONComments(fs.readFileSync(environmentFileName).toString()));
    } else {
        return JSON.parse(emptyEnvironmentContent);
    }
}

const isFile = path => {
    return fs.lstatSync(path).isFile();
}

module.exports = {
    saveCollection: saveCollection,
    saveEnvironment: saveEnvironment,
    readCollection: readCollection,
    readEnvironment: readEnvironment,
    isFile: isFile
};