const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const chalk = require('chalk');
const Collection = require('postman-collection').Collection;
const { saveCollection, line } = require('./helper');

const areWeKeepingTheItem = elementsToKeep => request => {
    if (request.items === undefined)
        return elementsToKeep.filter(uniqueElement => uniqueElement.id === request.id).length == 0;
    else
        return cleanupItemList(request, elementsToKeep);
}

const cleanupItemList = (listToClean, elementsToKeep) => listToClean.items.remove(areWeKeepingTheItem(elementsToKeep));

const createHash = item => {
    var sum = item.name;
    if (item.events)
        sum += JSON.stringify(item.events.toJSON());
    if (item.request)
        sum += JSON.stringify(item.request.toJSON());
    return sum;
}

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

const cleanDuplicates = originalList =>
    Array.from(new Set(originalList.map(createHash)))
        .map(element => {
            return originalList.find(item => createHash(item) === element)
        });


const cleanup = (sourceFileContent, targetCollectionName) => {
    const collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFileContent).toString())));
    const elementsToKeep = cleanDuplicates(flattenItems(collection.items, new Array()));
    console.log(chalk.cyan.bold("The following requests will remain in the collection"));
    line();
    elementsToKeep.forEach(item => console.log(chalk.yellow(item.name) + ": " + chalk.grey.bold(item.id)));
    cleanupItemList(collection, elementsToKeep);
    saveCollection(collection, targetCollectionName);
}

module.exports = {
    cleanup: cleanup,
};