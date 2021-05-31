const fs = require('fs/promises');
const Collection = require('postman-collection').Collection;
const { saveCollection, readCollection, isFile, exists } = require('./helper');

module.exports = async (sourceFileName, sourceFolder, targetCollectionName, collections) => {
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
                collection.items.each(item => {
                    //Avoiding duplicates
                    if (!targetCollectionContent.items.find(item)) {
                        //Avoiding empty variables
                        if (item.value !== "") {
                            targetCollectionContent.items.append(JSON.parse(JSON.stringify(item)));
                        }
                    }
                });
            }
        } else {
            throw new Error('File not found: ' + file);
        }
    });
    return saveCollection(targetCollectionContent, targetCollectionName);
}