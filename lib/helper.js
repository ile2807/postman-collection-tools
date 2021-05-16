const chalk = require('chalk');
const { exit } = require('process');

const line = () => console.log(chalk.gray("---------------------------------------------------------------------"));

const help = () => {
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
    console.log(
        chalk.cyan("-m [merge-variables] (mandatory)") + " Operation mode, possible options:"
    );
    console.log(
        chalk.yellow("    merge-variables") + " Merges variables from all source folder collection in the collection variables of the output collection"
    );
    console.log(
        chalk.yellow("    merge-requests") + " Merges all requests from all source folder collection into the output collection, collection variables are not transfered, only requests"
    );
    //TODO needs to be implemented
    //console.log(
    //    chalk.yellow("    merge-collection") + " Merges each collection requests from all collections in the source folder in a separate folder in the output collection. Collection variables in this mode are setup in the PreRequest script of each requests folder"
    //);
    line();
    console.log(
        chalk.gray.bold("Example:") + " jackal -m merge-variables -f ./examples -o result.json"
    );
    line();
    exit();
}

module.exports = {
    help: help,
    line: line,
};