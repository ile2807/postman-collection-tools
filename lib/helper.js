const fs = require('fs');

const saveCollection = (collection, outputFileName) => {
    let data = JSON.stringify(collection.toJSON(), null, "\t");
    //Writing the data
    fs.writeFileSync(outputFileName, data);
    return "OK";
}
const saveEnvironment = (collection, outputFileName) => {
    let data = JSON.stringify(collection, null, "\t");
    //Writing the data
    fs.writeFileSync(outputFileName, data);
    return "OK";
}

module.exports = {
    saveCollection: saveCollection,
    saveEnvironment:saveEnvironment
};