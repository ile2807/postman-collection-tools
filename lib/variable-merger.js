const fs = require('fs/promises');
const Collection = require('postman-collection').Collection;
const { saveCollection, saveEnvironment, readCollection, readEnvironment, isFile , exists} = require('./helper');

const mergeToCollection = async (sourceFileName, sourceFolder, outputFileName, collections) => {
    let targetCollectionContent = new Collection(readCollection(sourceFileName));
    let files;
    let path = sourceFolder + "/";
    if (collections !== undefined) {
        files = collections.split(",");
        //Setting path to empty because files in the collections will already contain the full path
        path = "";
    } else {
        files = await fs.readdir(sourceFolder);
    }
    files.forEach(file => {
        //Reading all the collection files
        if (exists(path + file)) {
            if (isFile(path + file)) {
                var collection = new Collection(readCollection(path + file));
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
        } else {
            throw new Error('File not found: ' + file);
        }
    });
    return saveCollection(targetCollectionContent, outputFileName);
}
const mergeToEnv = async (sourceFileName, sourceFolder, outputFileName, collections) => {
    const targetEnvironmentContent = readEnvironment(sourceFileName);
    let files;
    let path = sourceFolder + "/";
    if (collections !== undefined) {
        files = collections.split(",");
        //Setting path to empty because files in the collections will already contain the full path
        path = "";
    } else {
        files = await fs.readdir(sourceFolder);
    }
    files.forEach(file => {
        //Reading all the collection files
        if (exists(path + file)) {
            if (isFile(path + file)) {
                var collection = new Collection(readCollection(path + file));
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
        } else {
            throw new Error('File not found: ' + file);
        }
    });
    return saveEnvironment(targetEnvironmentContent, outputFileName);
}
module.exports = {
    mergeVariablesToCollection: mergeToCollection,
    mergeVariablesToEnvironment: mergeToEnv
}