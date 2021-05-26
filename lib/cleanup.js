const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const Collection = require('postman-collection').Collection;
const { saveCollection } = require('./helper');

//Determines wheather we need to keep current item by comparing it to the list to keep
const isThisAKeeper = (elementsToKeep, itemsThatWillBeRemoved) => request => {
    if (request.items === undefined)
        if (elementsToKeep.filter(uniqueElement => uniqueElement === request).length == 0) {
            const path = new Array();
            request.forEachParent(parent => path.push(parent.name));
            itemsThatWillBeRemoved.add("Path: " + path.reverse().join('/') + '/'+request.name);
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

//Main entrypoint, does all the cleaning
const cleanup = (sourceFileName, targetCollectionName) => {
    const collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFileName).toString())));
    const elementsToKeep = findElementToKeep(flattenItems(collection.items, new Array()));
    const itemsThatWillBeRemoved = new Set();
    cleanupItemList(collection, elementsToKeep, itemsThatWillBeRemoved);
    itemsThatWillBeRemoved.forEach(item => console.log(item));
    saveCollection(collection, targetCollectionName);
    return itemsThatWillBeRemoved;
}

module.exports = {
    cleanup: cleanup,
};