const Collection = require('postman-collection').Collection;
const { saveCollection, readCollection } = require('./helper');

function addTest200(sourceFileName, targetCollectionName) {
    var collection = new Collection(readCollection(sourceFileName));
    appendToItems(collection.items, generateTest200Code);
    return saveCollection(collection, targetCollectionName);
}

function addTestSmart(sourceFileName, targetCollectionName) {
    var collection = new Collection(readCollection(sourceFileName));
    appendToItems(collection.items, generateTestSmartCode);
    return saveCollection(collection, targetCollectionName);
}

//Recursive traver through folders and requests
//We want to add tests only to requests not to the folders
function appendToItems(items, codeGenerator) {
    items.each(item => {
        //if the item does not contain items, it means that it is request
        if (item.items === undefined) {
            appendTestScript(item, codeGenerator(item));
        } else {
            //otherwise its a folde so we need to recursively call the method to go one level deeper
            appendToItems(item.items, codeGenerator)
        }
    });
}

//Appends test script to the existing list of test commands and to the existing events, making sure to preserve the "prerequest" event
const appendTestScript = (item, codeGenerator) => {
    var testCode = item.events.find(e => e.listen === 'test');
    if (testCode === undefined) {
        testCode = new Array();
        codeGenerator(testCode);
        if (item.events == undefined) {
            item.event = [test(testCode.flat())];
        } else {
            item.events.append(test(testCode.flat()));
        }
    } else {
        codeGenerator(testCode.script.exec);
    }
}

//Code creation
const generateTest200Code = item => testCode => {
    testCode.push("//Begin of auto generated code by Jackal");
    testCode.push(createHttp200Test(item));
    testCode.push("//End of auto generated code by Jackal");
}

const generateTestSmartCode = item => testCode => {
    if (item.responses.members.length === 0) return;
    testCode.push("//Begin of auto generated code by Jackal");
    testCode.push("var jsonData = pm.response.json();");
    testCode.push('pm.test("Validating json response values for request: ' + item.name + '", function () {');
    item.responses.each(example => {
        var exampleResponse = JSON.parse(example.body);
        testCode.push.apply(testCode, createJsonValueTest(exampleResponse, ""));
    });
    testCode.push('});');
    testCode.push("//End of auto generated code by Jackal")
}

const test = (code) => script = {
    listen: "test",
    script: {
        "exec": code,
        "type": "text/javascript"
    }
}

const createHttp200Test = item => 'pm.test("Status code is 200 for request: ' + item.name + '", function () {pm.response.to.have.status(200);});';

const createJsonValueTest = (testingObject, path) => {
    var tests = new Array();
    Object.keys(testingObject).forEach(function (key) {
        var value = testingObject[key];
        if (typeof value === 'object') {
            var pathExtension = isNaN(key) ? "." + key : "[" + key + "]";
            return tests.push(createJsonValueTest(value, path + pathExtension));
        }
        if (typeof value === 'string' || value instanceof String)
            tests.push('pm.expect(jsonData' + path + '.' + key + ').to.eql("' + value + '");');
        else {
            tests.push("pm.expect(jsonData" + path + "." + key + ").to.eql(" + value + ");");
        }
    });
    return tests.flat();
}

module.exports = {
    addTest200: addTest200,
    addTestSmart: addTestSmart
};