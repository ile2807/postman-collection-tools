const fs = require('fs');
const stripJSONComments = require('strip-json-comments');
const Collection = require('postman-collection').Collection;
const args = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const { help, line } = require('./lib/helper');
const validateParameters = require('./lib/validation');

var sourceCollectionName = args.s;
const targetCollectionName = args.o;
const collectionsFolder = args.f;
const command = args.c;



clear();
console.log(
    chalk.yellow(
        figlet.textSync('Jackal', { horizontalLayout: 'full' })
    )
);
if (args.h) {
    help();
}

validateParameters(collectionsFolder, targetCollectionName);
var sourceFileContent = '{"_": {"postman_id": "8dd63cc7-61b4-4743-b7b2-bf95f661324a"},"item": []}';
if (sourceCollectionName != undefined) {
    sourceFileContent = fs.readFileSync(sourceCollectionName).toString();
}

console.log('Source collections folder > ' + chalk.cyan(collectionsFolder));
console.log('Start collection > ' + chalk.cyan(sourceCollectionName));
console.log('Target collection > ' + chalk.cyan(targetCollectionName));
line();

var targetCollection = new Collection(JSON.parse(sourceFileContent));

fs.readdir(collectionsFolder, (error, files) => {
    if (error) return console.log(error);
    files.forEach(file => {
        //Reading all the collection files
        var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(collectionsFolder + "/" + file).toString())));
        console.log("Processing source file: " + chalk.yellow(file))
        collection.variables.each(variable => {
            //Avoiding duplicates
            if (!targetCollection.variables.find(variable)) {
                //Avoiding empty variables
                if (variable.value !== "") {
                    targetCollection.variables.append(JSON.parse(JSON.stringify(variable)));
                }
            }
        })
    });
    let data = JSON.stringify(targetCollection.toJSON(), null, "\t");
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


