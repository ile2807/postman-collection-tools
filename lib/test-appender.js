const stripJSONComments = require('strip-json-comments');
const fs = require('fs');
const Collection = require('postman-collection').Collection;
const { saveCollection } = require('./helper');

function addTest200(sourceFileContent, targetCollectionName) {
    var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFileContent).toString())));
    appendToItems(collection.items, generateTest200Code);
    saveCollection(collection, targetCollectionName);
}

function addTestSmart(sourceFileContent, targetCollectionName) {
    var collection = new Collection(JSON.parse(stripJSONComments(fs.readFileSync(sourceFileContent).toString())));
    appendToItems(collection.items, generateTestSmartCode);
    saveCollection(collection, targetCollectionName);
}

//Recursive traver through folders and requests
//We want to add tests only to requests not to the folders
function appendToItems(items, codeGenerator) {
    items.each(item => {
        //if the item does not contain items, it means that it is request
        if (item.items === undefined) {
            appendTestScript(item, codeGenerator);
        } else {
            //otherwise its a folde so we need to recursively call the method to go one level deeper
            appendToItems(item.items, codeGenerator)
        }
    });
}

//Appends test script to the existing list of test commands and to the existing events, making sure to preserve the "prerequest" event
const appendTestScript = (request, codeGenerator) => {
    var testCode = request.events.find(e => e.listen === 'test');
    if (testCode === undefined) {
        testCode = new Array();
        codeGenerator(request)(testCode);
        if (request.events == undefined) {
            request.event = [test(testCode)];
        } else {
            request.events.append(test(testCode));
        }
    } else {
        codeGenerator(request)(testCode.script.exec);
    }
}

//Code creation
const generateTest200Code = request => testCode => {
    testCode.push("//Begin of auto generated code by Jackal");
    testCode.push(createHttp200Test(request));
    testCode.push("//End of auto generated code by Jackal");
}

const generateTestSmartCode = request => testCode => {
    testCode.push("//Begin of auto generated code by Jackal");
    testCode.push(createJsonValueTest(request));
    testCode.push("//End of auto generated code by Jackal");
}

const test = (code) => script = {
    listen: "test",
    script: {
        "exec": code,
        "type": "text/javascript"
    }
}

const createHttp200Test = request => 'pm.test("Status code is 200 for request: ' + request.name + '", function () {pm.response.to.have.status(200);});';

const createJsonValueTest = request => {
    return 'pm.test("Validating json response values for request: ' + request.name + '", function () {assert(true);});';
}

module.exports = {
    addTest200: addTest200,
    addTestSmart: addTestSmart
};