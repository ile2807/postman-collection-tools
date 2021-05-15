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
    line();
    console.log(
        chalk.gray.bold("Example:") + " jackal -f ./examples -o result.json"
    );
    line();
    exit();
}

module.exports = {
    help: help,
    line: line,
};