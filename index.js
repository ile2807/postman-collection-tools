const fs = require('fs');
const stripJSONComments = require('strip-json-comments');
const Collection = require('postman-collection').Collection;
const { exit } = require('process');
const args = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

var sourceCollectionName = args.s;
const targetCollectionName = args.o;
const collectionsFoleder = args.f;
const command = args.c;

const line = () => console.log(chalk.gray("---------------------------------------------------------------------"));

clear();
console.log(
    chalk.yellow(
        figlet.textSync('Jackal', { horizontalLayout: 'full' })
    )
);
if (args.h) {
    help();
}

validateParameters();
var sourceFileContent = '{"_": {"postman_id": "8dd63cc7-61b4-4743-b7b2-bf95f661324a"},"item": []}';
if (sourceCollectionName != undefined) {
    sourceFileContent = fs.readFileSync(sourceCollectionName).toString();
}

console.log('Source collections folder > ' + chalk.cyan(collectionsFoleder));
console.log('Start collection > ' + chalk.cyan(sourceCollectionName));
console.log('Target collection > ' + chalk.cyan(targetCollectionName));
line();

var targetCollection = new Collection(JSON.parse(sourceFileContent));

fs.readdir(collectionsFoleder, (error, files) => {
    if (error) return console.log(error);
    files.forEach(file => {
        //Reading all the collection files
        var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(collectionsFoleder + "/" + file).toString())));
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

function help() {
    console.log(
        chalk.blue.bold("Welcome to Postman collections tools, this is how to use the application")
    );
    line();
    console.log(
        chalk.yellow("run jackal command with the following parameters")
    );
    console.log(
        chalk.cyan("-s [source-collection.json] (optional)") + " This is the starting point file to enrich with the end result variables, if not present a blank collection is created and upgraded with the variables"
    );
    console.log(
        chalk.cyan("-f [source-folder] (mandatory)") + " This is a path to the folder that contains all source collections from where the application will get the collection variables"
    );
    console.log(
        chalk.cyan("-o [output-collection.json] (mandatory)") + " This is a filename where the result collection will be written"
    );
    line();
    console.log(
        chalk.gray.bold("Example:") + " jackal -f ./examples -o result.json"
    );
    line();
    exit();
}

function validateParameters() {
    if (collectionsFoleder == undefined) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("You must provide source folder with existing collections, use the -f option followed by the source folder path, or -h to see help");
        line();
        exit();
    }
    if (targetCollectionName == undefined) {
        console.log(
            chalk.red.bold("Parameters error")
        );
        line();
        console.log("You must provide target file, use -o option followed by the output file path, or -h to see help");
        line();
        exit();
    }
}

