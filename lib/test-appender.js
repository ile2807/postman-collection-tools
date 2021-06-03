const Collection = require('postman-collection').Collection;
const { saveCollection, readCollection } = require('./helper');
var parser = require('fast-xml-parser');
var he = require('he');

var options = {
    attributeNamePrefix: "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false, //"strict"
    attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }),//default is a=>a
    tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
    stopNodes: ["parse-me-as-string"]
};

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
    item.responses.each(example => {
        testCode.push("//Test for example: " + example.name);
        if (example._.postman_previewlanguage === 'json' || example._.postman_previewlanguage === 'script') {
            testCode.push("var jsonData = pm.response.json();");
            testCode.push('pm.test("Validating json response values for request: ' + item.name + '", function () {');
            const jsonResponse = JSON.parse(example.body);
            testCode.push.apply(testCode, createJsonValueTest(jsonResponse, ""));
        } else {
            testCode.push("const jsonObject = xml2Json(responseBody);");
            testCode.push('pm.test("Validating xml response values for request: ' + item.name + '", function () {');
            const convertedJson = parser.parse(example.body, options);
            testCode.push.apply(testCode, createXmlValueTest(convertedJson, ""));
        }
        testCode.push('});');
    });
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

const createXmlValueTest = (testingObject, path) => {
    var tests = new Array();
    Object.keys(testingObject).forEach(function (key) {
        var value = testingObject[key];
        if (typeof value === 'object') {
            let pathExtension;
            //This check is for soap envelope and body tags, they contain namespace defined with :, like this: soap:Envelope
            if (key.includes(":")) {
                pathExtension = "[\"" + key + "\"]";
            } else {
                pathExtension = isNaN(key) ? "." + key : "[" + key + "]";
            }
            return tests.push(createXmlValueTest(value, path + pathExtension));
        }
        if (typeof value === 'string' || value instanceof String)
            tests.push('pm.expect(jsonObject' + path + '.' + key + ').to.eql("' + value + '");');
        else {
            tests.push("pm.expect(jsonObject" + path + "." + key + ").to.eql(" + value + ");");
        }
    });
    return tests.flat();
}

module.exports = {
    addTest200: addTest200,
    addTestSmart: addTestSmart
};