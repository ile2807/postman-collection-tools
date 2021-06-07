const Collection = require('postman-collection').Collection;
const { saveCollection, readCollection } = require('./helper');
var parser = require('fast-xml-parser');
var he = require('he');
const introComment = "//Begin of auto generated code by Jackal";
const trailerComment = "//End of auto generated code by Jackal";

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
    appendToItems(collection.items, generateTest200Code, 'test');
    return saveCollection(collection, targetCollectionName);
}

function addTestSmart(sourceFileName, targetCollectionName) {
    var collection = new Collection(readCollection(sourceFileName));
    appendToItems(collection.items, generateTestSmartCode, 'test');
    return saveCollection(collection, targetCollectionName);
}

function appendRequestHash(sourceFileName, targetCollectionName) {
    var collection = new Collection(readCollection(sourceFileName));
    appendToItems(collection.items, generateHashingCode, 'prerequest');
    return saveCollection(collection, targetCollectionName);
}

//Recursive traver through folders and requests
//We want to add tests only to requests not to the folders
function appendToItems(items, codeGenerator, eventLocation) {
    items.each(item => {
        //if the item does not contain items, it means that it is request
        if (item.items === undefined) {
            appendScript(item, codeGenerator(item), eventLocation);
        } else {
            //otherwise its a folde so we need to recursively call the method to go one level deeper
            appendToItems(item.items, codeGenerator, eventLocation)
        }
    });
}

//Appends test script to the existing list of test commands and to the existing events, making sure to preserve the "prerequest" event
const appendScript = (item, codeGenerator, eventLocation) => {
    var testCode = item.events.find(e => e.listen === eventLocation);
    if (testCode === undefined) {
        testCode = new Array();
        codeGenerator(testCode);
        if (item.events == undefined) {
            item.event = [createEvents(eventLocation)(testCode.flat())];
        } else {
            item.events.append(createEvents(eventLocation)(testCode.flat()));
        }
    } else {
        codeGenerator(testCode.script.exec);
    }
}

//Code creation
const generateTest200Code = item => testCode => {
    testCode.push(introComment);
    testCode.push(createHttp200Test(item));
    testCode.push(trailerComment);
}

//PreRequest Hash code creation
const generateHashingCode = item => testCode => {
    testCode.push(introComment);
    testCode.push("//Hashing request for " + item.name);
    testCode.push("if (pm.request.body) {");
    testCode.push(" var requestBody = pm.variables.replaceIn(pm.request.body.raw);");
    testCode.push(" var password = pm.variables.get(\"hashPassword\");");
    testCode.push(" if (password == undefined) {");
    testCode.push("     password = \"defaultPass\";");
    testCode.push(" }");
    testCode.push(" var hash = CryptoJS.HmacSHA256(requestBody, password).toString(CryptoJS.digest);");
    testCode.push(" pm.request.headers.upsert({key:'PayloadHash', value:hash.toString()})");
    testCode.push("}");
    testCode.push(trailerComment);
}

const generateTestSmartCode = item => testCode => {
    if (item.responses.members.length === 0) return;
    testCode.push(introComment);
    item.responses.each(example => {
        if (example._ !== undefined) {
            testCode.push("//Test for example: " + example.name);
            if (example._.postman_previewlanguage === 'json' || example._.postman_previewlanguage === 'script') {
                testCode.push("var jsonData = pm.response.json();");
                testCode.push('pm.test("Validating json response values for request: ' + item.name + '", function () {');
                const jsonResponse = JSON.parse(example.body);
                testCode.push.apply(testCode, createJsonValueTest(jsonResponse, ""));
            } else if(example._.postman_previewlanguage === 'xml'){
                testCode.push("const jsonObject = xml2Json(responseBody);");
                testCode.push('pm.test("Validating xml response values for request: ' + item.name + '", function () {');
                const convertedJson = parser.parse(example.body, options);
                testCode.push.apply(testCode, createXmlValueTest(convertedJson, ""));
            }
            testCode.push('});');
        }
    });
    testCode.push(trailerComment)
}

//Adds code to specified location
//For location possible options are: test, prerequest
const createEvents = (location) => (code) => script = {
    listen: location,
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
    addTestSmart: addTestSmart,
    appendRequestHash: appendRequestHash
};