const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const Collection = require('postman-collection').Collection;
const chalk = require('chalk');
const { line } = require('./helper');

function addTest200(sourceFileContent, targetCollectionName) {
    var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFileContent).toString())));
    appendToItems(collection.items);
    let data = JSON.stringify(collection.toJSON(), null, "\t");
    //Writing the data
    fs.writeFile(targetCollectionName, data, function (err) {
        if (err) return console.log(err);
        line();
        console.log(
            chalk.green.bold("Tests appending fiinished successfully")
        );
        line();
    });
}
//Recursive traver through folders and requests
//We want to add tests only to requests not to the folders
function appendToItems(items) {
    items.each(item => {
        //if the item does not contain items, it means that it is request
        if (item.items === undefined) {
            appendTestScript(item);
        } else {
            //otherwise its a folde so we need to recursively call the method to go one level deeper
            appendToItems(item.items)
        }
    });
}

//Appends test script to the existing list of test commands and to the existing events, making sure to preserve the "prerequest" event
const appendTestScript = (request) => {
    var testCode = request.events.find(e => e.listen === 'test');
    if (testCode === undefined) {
        testCode = new Array();
        appendTest200Code(testCode);
        if (request.events == undefined) {
            request.event = [test(testCode)];
        } else {
            request.events.append(test(testCode));
        }
    } else {
        appendTest200Code(testCode.script.exec);
    }
}

//Code creation
const appendTest200Code = (testCode) => {
    testCode.push("//Begin of auto generated code by Jackal");
    testCode.push(createHttp200Test());
    testCode.push("//End of auto generated code by Jackal");
}

const test = (code) => script = {
    listen: "test",
    script: {
        "exec": code,
        "type": "text/javascript"
    }
}

const createHttp200Test = () => 'pm.test("Status code is 200", function () {pm.response.to.have.status(200);});';


module.exports = {
    addTest200: addTest200,
};