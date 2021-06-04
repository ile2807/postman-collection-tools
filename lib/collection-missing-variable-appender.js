const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const Collection = require('postman-collection').Collection;
const { saveCollection } = require('./helper');

function appendVariables(sourceFileName, targetCollectionName) {
    var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFileName).toString())));
    appendToItems(collection.items, collection.variables);
    return saveCollection(collection, targetCollectionName);
}

//Recursive traver through folders and requests
//We want to add tests only to requests not to the folders
function appendToItems(items, variables) {
    items.each(item => {
        //if the item does not contain items, it means that it is request
        if (item.items === undefined) {
            appendVariablesFromItem(item, variables);
        } else {
            //otherwise its a folde so we need to recursively call the method to go one level deeper
            appendToItems(item.items, variables)
        }
    });
}

const appendVariablesFromItem = (item, variables) => {
    const itemCode = JSON.stringify(item);
    //console.log(itemCode);
    var re = /{{[{]?(.*?)[}]?}}/g;
    while (variable = re.exec(itemCode)) {
        var variableKey = variable[0];
        variableKey = variableKey.substring(2, variableKey.length - 2);
        //Avoiding duplicates
        if (!variables.find(variable => variable.key === variableKey)) {
            variables.append({ type: 'any', value: null, key: variableKey });
        }
    }
}


module.exports = {
    appendVariables: appendVariables
};