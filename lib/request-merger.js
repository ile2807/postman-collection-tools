const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const Collection = require('postman-collection').Collection;
const { saveCollection } = require('./helper');

module.exports = (sourceFileName, sourceFolder, targetCollectionName) => {
    var targetCollectionContent = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFileName).toString())));
    fs.readdir(sourceFolder, (error, files) => {
        if (error) return console.log(error);
        files.forEach(file => {
            //Reading all the collection files
            if (fs.lstatSync(sourceFolder + "/" + file).isFile()) {
                var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFolder + "/" + file).toString())));
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