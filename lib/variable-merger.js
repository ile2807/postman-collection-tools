const fs = require('fs/promises');
const Collection = require('postman-collection').Collection;
const { saveCollection, saveEnvironment, readCollection, readEnvironment, isFile } = require('./helper');

const mergeToCollection = async (sourceFileName, sourceFolder, outputFileName) => {
    var targetCollectionContent = new Collection(readCollection(sourceFileName));
    const files = await fs.readdir(sourceFolder);
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
}
const mergeToEnv = async (sourceFileName, sourceFolder, outputFileName) => {
    const targetEnvironmentContent = readEnvironment(sourceFileName);
    const files = await fs.readdir(sourceFolder)
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
}
module.exports = {
    mergeVariablesToCollection: mergeToCollection,
    mergeVariablesToEnvironment: mergeToEnv
}