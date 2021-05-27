const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const Collection = require('postman-collection').Collection;
const { saveCollection, saveEnvironment, readCollection, readEnvironment , isFile} = require('./helper');

const mergeToCollection = (sourceFileName, sourceFolder, outputFileName) => {
    var targetCollectionContent = new Collection(readCollection(sourceFileName));
    fs.readdir(sourceFolder, (error, files) => {
        if (error) return error;
        files.forEach(file => {
            //Reading all the collection files
            if (isFile(sourceFolder + "/" + file)) {
                var collection = new Collection(readCollection(sourceFolder + "/" + file));
                collection.variables.each(variable => {
                    //Avoiding duplicates
                    if (!targetCollectionContent.variables.find(variable)) {
                        //Avoiding empty variables
                        if (variable.value !== "") {
                            targetCollectionContent.variables.append(JSON.parse(JSON.stringify(variable)));
                        }
                    }
                });
            }
        });
        return saveCollection(targetCollectionContent, outputFileName);
    });
}
const mergeToEnv = (sourceFileName, sourceFolder, outputFileName) => {
    var targetEnvironmentContent = readEnvironment(sourceFileName);
    fs.readdir(sourceFolder, (error, files) => {
        if (error) return console.log(error);
        files.forEach(file => {
            //Reading all the collection files
            if (isFile(sourceFolder + "/" + file)) {
                var collection = new Collection(readCollection(sourceFolder + "/" + file));
                collection.variables.each(variable => {
                    //Avoiding duplicates
                    if (!targetEnvironmentContent.values.find(k => k.key === variable.key)) {
                        //Avoiding empty variables
                        if (variable.value !== "") {
                            targetEnvironmentContent.values.push({ key: variable.key, value: variable.value, enabled: true });
                        }
                    }
                });
            }
        });
        return saveEnvironment(targetEnvironmentContent, outputFileName);
    });
}
module.exports = {
    mergeVariablesToCollection: mergeToCollection,
    mergeVariablesToEnvironment: mergeToEnv
}