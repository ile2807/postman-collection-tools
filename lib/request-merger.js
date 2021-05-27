const fs = require('fs');
const Collection = require('postman-collection').Collection;
const { saveCollection, readCollection, isFile } = require('./helper');

module.exports = (sourceFileName, sourceFolder, targetCollectionName) => {
    var targetCollectionContent = new Collection(readCollection(sourceFileName));
    fs.readdir(sourceFolder, (error, files) => {
        if (error) return console.log(error);
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
    });
}