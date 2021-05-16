const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const Collection = require('postman-collection').Collection;
const chalk = require('chalk');
const { line } = require('./helper');

module.exports = (sourceFileContent, sourceFolder, targetCollectionName) => {
    var targetCollectionContent = new Collection(JSON.parse(sourceFileContent));
    fs.readdir(sourceFolder, (error, files) => {
        if (error) return console.log(error);
        files.forEach(file => {
            //Reading all the collection files
            var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFolder + "/" + file).toString())));
            console.log("Processing source file: " + chalk.yellow(file))
            collection.items.each(item => {
                //Avoiding duplicates
                if (!targetCollectionContent.items.find(item)) {
                    //Avoiding empty variables
                    if (item.value !== "") {
                        targetCollectionContent.items.append(JSON.parse(JSON.stringify(item)));
                    }
                }
            });
        });
        let data = JSON.stringify(targetCollectionContent.toJSON(), null, "\t");
        //Writing the data
        fs.writeFile(targetCollectionName, data, function (err) {
            if (err) return console.log(err);
            line();
            console.log(
                chalk.green.bold("Merge fiinished successfully")
            );
            line();
        });
    });
}