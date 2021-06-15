const Collection = require('postman-collection').Collection;
const { readCollection, saveCollection } = require('./helper');


function generateDescriptions(sourceFileName, targetMDFile) {
    var collection = new Collection(readCollection(sourceFileName));
    generateMarkdownForCollection(collection);
    generateDescriptionForItem(collection.items);
    return saveCollection(collection, targetMDFile);
}

//Recursive traver through folders and requests
//We want to add tests only to requests not to the folders
function generateDescriptionForItem(items) {
    items.each(item => {
        //if the item does not contain items, it means that it is request
        if (item.items === undefined) {
            generateMarkdownForRequest(item);
        } else {
            //otherwise its a folde so we need to recursively call the method to go one level deeper
            generateMarkdownForFolder(item);
            generateDescriptionForItem(item.items);
        }
    });
}

const generateMarkdownForRequest = item => {
    let description = new Array();
    description.push(generateURLMarkdown(item.request).join(""));
    description.push(generateAuthorizationMarkdown(item.request.auth).join(""));
    description.push(generateHeaderMarkdown(item.request).join(""));
    description.push(generateBodyMarkdown(item.request.body).join(""));
    description.push(generatePreRequestMarkdown(item.events).join(""));
    description.push(generateTestsMarkdown(item.events).join(""));
    description.push(generateExamplesMarkdown(item).join(""));
    item.request.describe(description.join(""), "text/markdown");
}

const generateMarkdownForFolder = folderItem => {
    let description = new Array();
    description.push(generateAuthorizationMarkdown(folderItem.auth).join(""));
    description.push(generatePreRequestMarkdown(folderItem.events).join(""));
    description.push(generateTestsMarkdown(folderItem.events).join(""));
    folderItem.describe(description.join(""), "text/markdown");
}

const generateMarkdownForCollection = collection => {
    let description = new Array();
    description.push(generateCollectionVariablesMarkdown(collection.variables).join(""));
    description.push(generateAuthorizationMarkdown(collection.auth).join(""));
    description.push(generatePreRequestMarkdown(collection.events).join(""));
    description.push(generateTestsMarkdown(collection.events).join(""));
    collection.description = description.join("");
}
const generateURLMarkdown = request => {
    let urlNote = new Array();
    urlNote.push("\n## Url\n");
    urlNote.push("`" + request.method + '` ');
    urlNote.push(" `");
    urlNote.push(request.url.protocol != undefined ? request.url.protocol[0] + "://" : "")
    urlNote.push(request.url.host != undefined ? request.url.host[0] : "");
    urlNote.push(request.url.port != undefined ? ":" + request.url.port[0] : "");
    urlNote.push(request.url.path != undefined ? "/" + request.url.path.join("/") : "");
    urlNote.push("`\n");
    if (request.url.auth != undefined || request.url.hash != undefined) {
        urlNote.push("\n|URL Auth|Hash|\n|---|---|\n");
        urlNote.push("|" + (request.url.auth != undefined ? request.url.auth : ""));
        urlNote.push("|" + (request.url.hash != undefined ? request.url.hash : ""));
        urlNote.push("|\n");
    }
    return urlNote;
}

const generateTestsMarkdown = events => {
    const testsCode = events.find(e => e.listen === 'test');
    re = /pm\.test\(\"(.*?)\"/g;
    let tests = new Array();
    if (testsCode != undefined && testsCode.script != undefined && testsCode.script.exec.length > 0 && testsCode.script.exec.join("") != "") {
        const testCodeText = testsCode.script.exec.join("\n");
        tests.push("\n## Tests \n ");
        tests.push(extractTestNames(re, testCodeText).join("\n"));
        tests.push("\n<details><summary>Details...</summary><p>\n\n");
        tests.push("```JS\n" + testCodeText + '\n```');
        tests.push("\n");
        tests.push("</p></details>\n");
    }
    tests.push("\n");
    return tests;
}

const extractTestNames = (re, text) => {
    let testNames = new Array();
    while (testCase = re.exec(text)) {
        var testName = testCase[0].substring(9, testCase[0].length - 1);
        testNames.push("- " + testName);
    }
    if (testNames.length == 0) {
        testNames.push("- No tests assertions");
    }
    return testNames;
}

const generatePreRequestMarkdown = events => {
    const preRequestCode = events.find(e => e.listen === 'prerequest');
    let preScript = new Array();
    if (preRequestCode != undefined && preRequestCode.script != undefined && preRequestCode.script.exec.length > 0 && preRequestCode.script.exec.join("") != "") {
        preScript.push("\n## Pre Request\n");
        preScript.push("```JS\n" + preRequestCode.script.exec.join("\n") + '\n```');
    }
    return preScript;

}

const generateAuthorizationMarkdown = auth => {
    let authenticationList = new Array();
    if (auth != undefined) {
        authenticationList.push("\n## Authentication type: `" + auth.type + "`\n");
        if (auth[auth.type].members.length > 0) {
            authenticationList.push("\n|Key|Value|\n|---|---|\n");
            auth[auth.type].members.forEach(member => {
                authenticationList.push("|`" + member.key + "`|" + (member.value != undefined ? member.value : "") + "|\n");
            });
        }
    }
    return authenticationList;
}

const generateHeaderMarkdown = request => {
    let headersTable = new Array();
    if (request.headers.members.length > 0) {
        headersTable.push("\n## Request Headers\n");
        headersTable.push("\n|Header key|Header value|\n|---|---|\n");
        request.forEachHeader(header => {
            headersTable.push("|`" + header.key + "`|" + (header.value != undefined ? header.value : "") + "|\n");
        });
    }
    return headersTable;
}

const generateCollectionVariablesMarkdown = variables => {
    let variablesTable = new Array();
    variablesTable.push("\n## Collection Variables\n");
    variablesTable.push("\n|Variable name|Variable value|\n|---|---|\n");
    variables.each(variable =>
        variablesTable.push("|`" + variable.key + "`|" + (variable.value != undefined ? variable.value : "N/A") + "|\n")
    );
    return variablesTable;
}

const generateBodyMarkdown = body => {
    let bodyContent = new Array();
    if (body != undefined) {
        bodyContent.push("\n## Body type: `" + body.mode + "`\n");
        if (body.mode === 'formdata') {
            bodyContent.push("\n|Form parameter name|Form parameter value|\n|---|---|\n");
            body.formdata.each(li => {
                bodyContent.push("|`" + li.key + "`|" + (li.value != undefined ? li.value : "") + "|\n");
            });
        } else if (body.mode === 'raw') {
            if (body.raw != undefined) {
                if (body.options == undefined) {
                    bodyContent.push("### Raw content\n");
                } else {
                    bodyContent.push("### Raw content of type: " + body.options.raw.language + "\n");
                }
                bodyContent.push("\n<details><summary>Details...</summary><p>\n\n");
                bodyContent.push("```JS\n" + body.raw + '\n```');
                bodyContent.push("\n");
                bodyContent.push("</p></details>\n");
                bodyContent.push("\n");
            }
        } else if (body.mode === 'urlencoded') {
            bodyContent.push("\n|Parameter name|Parameter value|\n|---|---|\n");
            body.urlencoded.each(li => {
                bodyContent.push("|`" + li.key + "`|" + (li.value != undefined ? li.value : "") + "|\n");
            });
        } else if (body.mode === 'file') {
            bodyContent.push("> File name: " + body.file.src + "\n");
        } else if (body.mode === 'graphql') {
            bodyContent.push("> Operatoion name: " + body.graphql.operationName + "\n");
            bodyContent.push("\n### GraphQL query\n");
            bodyContent.push("```JS\n" + body.graphql.query + '\n```');
            bodyContent.push("\n### GraphQL variables\n");
            bodyContent.push("```JS\n" + body.graphql.variables + '\n```');
            bodyContent.push("\n");
        }
    }
    return bodyContent;
}
const generateExamplesMarkdown = item => {
    let examplesList = new Array();
    if (item.responses.length > 0) {
        examplesList.push("\n# Example responses\n");
        item.responses.each(example => {
            if (example._ !== undefined) {
                examplesList.push("\n## " + example.name);
                examplesList.push("\n<details><summary>Details...</summary><p>\n\n");
                examplesList.push("\n```" + example._.postman_previewlanguage + "\n" + example.body + '\n```');
                examplesList.push("\n");
                examplesList.push("</p></details>\n");
                examplesList.push("\n");
            }
        });
    }
    return examplesList;
}

module.exports = {
    generateDescriptions: generateDescriptions
};