const Collection = require('postman-collection').Collection;
const { saveFile, readCollection } = require('./helper');
const { mdToPdf } = require('md-to-pdf');


function exportDescriptionMD(sourceFileName, targetMDFile) {
    var collection = new Collection(readCollection(sourceFileName));
    var content = new Array();
    content.push("# `Collection` ***" + collection.name + "***\n");
    content.push(collection.description+"\n");
    extractDescriptions(collection.items, appendMarkdownCode(content))
    return saveFile(content.join('\n'), targetMDFile);
}

async function exportDescriptionPDF(sourceFileName, targetPdfFile) {
    var collection = new Collection(readCollection(sourceFileName));
    var content = new Array();
    content.push("# `Collection` ***" + collection.name + "***\n");
    content.push(collection.description+"\n");
    extractDescriptions(collection.items, appendMarkdownCode(content))
    const pdf = await mdToPdf({ content: content.join('\n') }).catch(console.error);
    if (pdf) {
        return saveFile(pdf.content, targetPdfFile);
    }
    return "PDF creation error occurred";
}

//Recursive traver through folders and requests
//We want to add tests only to requests not to the folders
function extractDescriptions(items, extractor) {
    items.each(item => {
        //if the item does not contain items, it means that it is request
        if (item.items === undefined) {
            extractor(item, true);
        } else {
            //otherwise its a folde so we need to recursively call the method to go one level deeper
            extractor(item, false);
            extractDescriptions(item.items, extractor)
        }
    });
}

//Code creation
const appendMarkdownCode = content => (item, isRequest) => {
    if (isRequest) {
        content.push(generateMarkdownRequest(item));
    } else {
        content.push(generateMarkdownFolder(item));
    }
}

const generateMarkdownRequest = item => {
    var requestMarkdown = '## `Request` ' + item.name;
    if (item.request.description !== undefined) {
        requestMarkdown += '\n' + downgradeHeadings(item.request.description.content);
    }
    return requestMarkdown;
}

const downgradeHeadings = text => text.replace(/\n### /g, "\n##### ").replace(/\n## /g, "\n#### ").replace(/\n# /g, "\n### ");

const generateMarkdownFolder = folderItem => {
    var requestMarkdown = '# `Folder` ' + folderItem.name;
    if (folderItem.description !== undefined) {
        requestMarkdown += '\n' + downgradeHeadings(folderItem.description.content);
    }
    requestMarkdown += '\n ---';
    return requestMarkdown;
}
module.exports = {
    exportDescriptionMD: exportDescriptionMD,
    exportDescriptionPDF: exportDescriptionPDF,
};