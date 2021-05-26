const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const Collection = require('postman-collection').Collection;
const { saveCollection } = require('./helper');
const { v4 } = require('uuid');

const mergeCollections = (sourceFileContent, sourceFolder, targetCollectionName) => {
    var targetCollectionContent = new Collection(JSON.parse(sourceFileContent));
    fs.readdir(sourceFolder, (error, files) => {
        if (error) return console.log(error);
        files.forEach(file => {
            //Reading all the collection files
            if (fs.lstatSync(sourceFolder + "/" + file).isFile()) {
                var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFolder + "/" + file).toString())));
                //Avoiding duplicates
                targetCollectionContent.items.append(createFolderItem(collection));
            }
        });
        saveCollection(targetCollectionContent, targetCollectionName);
    });
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
