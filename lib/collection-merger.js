const fs = require('fs/promises');
const Collection = require('postman-collection').Collection;
const { saveCollection, readCollection, isFile, exists } = require('./helper');
const { v4 } = require('uuid');

const mergeCollections = async (sourceFileName, sourceFolder, targetCollectionName, collections) => {
    const targetCollectionContent = new Collection(readCollection(sourceFileName));
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
                //Avoiding duplicates
                targetCollectionContent.items.append(createFolderItem(collection));
            }
        } else {
            throw new Error('File not found: ' + file);
        }
    });
    return saveCollection(targetCollectionContent, targetCollectionName);
}

const createFolderItem = (collection) => {
    var folderStructure = {
        id: v4(),
        name: collection.name,
        items: collection.items,
        event: [createPreRequestScript(collection)]
    }
    return folderStructure;
}

const createPreRequestScript = (collection) => {
    var code = new Array();
    code.push("//Begin of auto generated code by Jackal");
    collection.variables.each(variable => {
        //Avoiding empty variables
        if (variable.value !== "") {
            code.push(createCommand(variable));
        }
    });
    code.push("//End of auto generated code by Jackal");
    return preRequest(code);
}

const preRequest = (code) => script = {
    listen: "prerequest",
    script: {
        "exec": code,
        "type": "text/javascript"
    }
}

const createCommand = (variable) => "pm.collectionVariables.set('" + variable.key + "','" + variable.value + "');";

module.exports = mergeCollections
