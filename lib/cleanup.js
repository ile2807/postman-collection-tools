const Collection = require('postman-collection').Collection;
const { saveCollection, readCollection } = require('./helper');

//Determines wheather we need to keep current item by comparing it to the list to keep
const isThisAKeeper = (elementsToKeep, itemsThatWillBeRemoved) => request => {
    if (request.items === undefined)
        if (elementsToKeep.filter(uniqueElement => uniqueElement === request).length == 0) {
            const path = new Array();
            request.forEachParent(parent => path.push(parent.name));
            itemsThatWillBeRemoved.add("Request is removed: " + path.reverse().join('/') + '/' + request.name);
            return true;
        } else {
            return false;
        }
    return cleanupItemList(request, elementsToKeep, itemsThatWillBeRemoved);
}

//Iterator for cleaning up the list
const cleanupItemList = (listToClean, elementsToKeep, itemsThatWillBeRemoved) => listToClean.items.remove(isThisAKeeper(elementsToKeep, itemsThatWillBeRemoved));

//Creating hash for each request, this is actually the duplicate criteria
const createHash = item => {
    var sum = item.name;
    if (item.events)
        sum += JSON.stringify(item.events.toJSON());
    if (item.request)
        sum += JSON.stringify(item.request.toJSON());
    return sum;
}

//Used for flattening the tree so duplicates are easier to locate
const flattenItems = (items, flatList) => {
    items.each(item => {
        if (item.items === undefined) {
            flatList.push(item);
        } else {
            flattenItems(item.items, flatList);
        }
    });
    return flatList;
}

//Returns only the unique elements from the list compared by the createHash function
const findElementToKeep = originalList =>
    Array.from(new Set(originalList.map(createHash)))
        .map(element => {
            return originalList.find(item => createHash(item) === element)
        });

//Returns a set of used variables in the whole collection
const findUsedVariables = collectionsContent => {
    const usedVariables = new Set();
    re = /{{[{]?(.*?)[}]?}}/g;
    findWithRegex(re, collectionsContent, 2, 2, usedVariables);
    re = /variables\.get\(\\\"(.*?)\\\"\)/g;
    findWithRegex(re, collectionsContent, 16, 3, usedVariables);
    re = /collectionVariables\.get\(\\\"(.*?)\\\"\)/g;
    findWithRegex(re, collectionsContent, 26, 3, usedVariables);
    //To be reconsidered if looking for the other variables should affect the collection variables
    //Above code works and its tested, however not sure at the moment it should be used
    // re = /globals\.get\(\\\"(.*?)\\\"\)/g;
    // findWithRegex(re, collectionsContent, 14, 3, usedVariables);
    // re = /environment\.get\(\\\"(.*?)\\\"\)/g;
    // findWithRegex(re, collectionsContent, 18, 3, usedVariables);
    return usedVariables;
}

//Returns a set of variables for a given regex
const findWithRegex = (re, text, before, after, resultSet) => {
    while (variable = re.exec(text)) {
        var variableKey = variable[0];
        variableKey = variableKey.substring(before, variableKey.length - after);
        resultSet.add(variableKey);
    }
}

//Cleans the collection from unused variables
const cleanCollection = (collection, usedVariables, itemsThatWillBeRemoved) => {
    collection.variables = collection.variables.filter(element => {
        if(!usedVariables.has(element.key)){
            itemsThatWillBeRemoved.add(element.key);
        }
        return usedVariables.has(element.key);
    });
}


//Main entrypoint, does all the request cleaning
const cleanRequests = (sourceFileName, targetCollectionName) => {
    const collection = new Collection(readCollection(sourceFileName));
    const elementsToKeep = findElementToKeep(flattenItems(collection.items, new Array()));
    const itemsThatWillBeRemoved = new Set();
    cleanupItemList(collection, elementsToKeep, itemsThatWillBeRemoved);
    saveCollection(collection, targetCollectionName);
    return itemsThatWillBeRemoved;
}

const cleanVariables = (sourceFileName, targetCollectionName) => {
    const collectionContent = readCollection(sourceFileName);
    const collection = new Collection(collectionContent);
    const usedVariables = findUsedVariables(JSON.stringify(collectionContent));
    const itemsThatWillBeRemoved = new Set();
    cleanCollection(collection, usedVariables, itemsThatWillBeRemoved);
    saveCollection(collection, targetCollectionName);
    return itemsThatWillBeRemoved;
}

module.exports = {
    cleanRequests: cleanRequests,
    cleanVariables: cleanVariables
};