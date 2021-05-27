const fs = require('fs/promises');
const Collection = require('postman-collection').Collection;
const { saveCollection, readCollection, isFile } = require('./helper');

module.exports = async (sourceFileName, sourceFolder, targetCollectionName) => {
    const targetCollectionContent = new Collection(readCollection(sourceFileName));
    const files = await fs.readdir(sourceFolder)
    files.forEach(file => {
        //Reading all the collection files
        if (isFile(sourceFolder + "/" + file)) {
            var collection = new Collection(readCollection(sourceFolder + "/" + file));
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
    });
    return saveCollection(targetCollectionContent, targetCollectionName);
}