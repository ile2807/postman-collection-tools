const fs = require('fs');

const saveCollection = (collection, outputFileName) => {
    let data = JSON.stringify(collection.toJSON(), null, "\t");
    //Writing the data
    fs.writeFileSync(outputFileName, data);
}
const saveEnvironment = (collection, outputFileName) => {
    let data = JSON.stringify(collection, null, "\t");
    //Writing the data
    fs.writeFileSync(outputFileName, data);
}

module.exports = {
    saveCollection: saveCollection,
    saveEnvironment:saveEnvironment
};