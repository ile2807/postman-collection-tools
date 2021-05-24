const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const Collection = require('postman-collection').Collection;
const { saveCollection, saveEnvironment } = require('./helper');
const chalk = require('chalk');

const mergeToCollection = (sourceFileContent, sourceFolder, outputFileName) => {
    var targetCollectionContent = new Collection(JSON.parse(sourceFileContent));
    fs.readdir(sourceFolder, (error, files) => {
        if (error) return console.log(error);
        files.forEach(file => {
            //Reading all the collection files
            if (fs.lstatSync(sourceFolder + "/" + file).isFile()) {
                var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFolder + "/" + file).toString())));
                console.log("Processing source file: " + chalk.yellow(file))
                collection.variables.each(variable => {
                    //Avoiding duplicates
                    if (!targetCollectionContent.variables.find(variable)) {
                        //Avoiding empty variables
                        if (variable.value !== "") {
                            targetCollectionContent.variables.append(JSON.parse(JSON.stringify(variable)));
                        }
                    }
                });
            }
        });
        saveCollection(targetCollectionContent, outputFileName);
    });
}
const mergeToEnv = (sourceFileContent, sourceFolder, outputFileName) => {
    var targetEnvironmentContent = JSON.parse(sourceFileContent);
    fs.readdir(sourceFolder, (error, files) => {
        if (error) return console.log(error);
        files.forEach(file => {
            //Reading all the collection files
            if (fs.lstatSync(sourceFolder + "/" + file).isFile()) {
                var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFolder + "/" + file).toString())));
                console.log("Processing source file: " + chalk.yellow(file))
                collection.variables.each(variable => {
                    //Avoiding duplicates
                    if (!targetEnvironmentContent.values.find(k => k.key === variable.key)) {
                        //Avoiding empty variables
                        if (variable.value !== "") {
                            targetEnvironmentContent.values.push({ key: variable.key, value: variable.value, enabled: true });
                        }
                    }
                });
            }
        });
        saveEnvironment(targetEnvironmentContent, outputFileName);
    });
}
module.exports = {
    mergeVariablesToCollection: mergeToCollection,
    mergeVariablesToEnvironment: mergeToEnv
}