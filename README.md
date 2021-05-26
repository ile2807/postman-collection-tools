# Jackal tools core
Jackal tools is an utility core library that manipulates `Postman collections`.

This library has multiple features distinguished by the `command` parameter (see below).
It combines collection items from [Postman](https://www.postman.com/) collections located in the `source` folder and appends into the `target` collection. The application is mainly focused on collection feature aggregations, and maintenance of single collections. 
All merge commands are using ***one output collection from many source collections***, and the rest of the commands are ***one input collection to one output collection***.

## How to use it

### Installing npm module

```bash
npm i jackal-postman
```

### Using it in code
```JS
const jackal = require("jackal-postman");
jackal("clr", "sourceFile.json", "./sourceFolder", "outputFile.json");
```

## Commands options

|Command   |Meaning   |Behavior   |
|---|---|---|
|**mv**  |Merge collection variables  |Merges all variables from all source folder collections in the collection variables of the output collection   |
|**mev** |Merge collection variables in an environment file| Merges all collection variables from all source folder collections to an output environment file. If no source environment is specified, a blank one will be used as starting point|
|**mr**   |Merge collection requests   |Merges all requests from all source folder collections into the output collection, collection variables are not transfered, only requests  |
|**mc** |Merge collection in folders |Merges each collection requests from all collections (from the source folder) in a separate folder in the output collection. Collection variables with this command are setup in the PreRequest script of each requests folder|
|**ts**|Append smart test assertions|Adds response validation asserts to all requests of the source collection and saves to the output collection. ***Smart tests are generated by using the saved responses as [examples](https://learning.postman.com/docs/sending-requests/responses/) in the collection***. This command analyses the saved responses and creates tests to match those values. Currently this command supports only JSON response testing. With this command, the `sourceFolder` is not used|
|**t200**     |Append HTTP 200 test assertions      |Adds test asserts (to check if response HTTP code is 200) to all requests of the source collection and saves to the output collection. With this command, the `sourceFolder` is not used 
|**clr**          |Remove duplicate requests   |All repeating occurrences of absolutely the same requests (including name) will be removed, only one will remain. The remaining instance is the first occurrence that the cleanup algorithm encounters while analyzing. Scope of comparing duplicates is the whole collection with all folders and subfolders. With this command, the `sourceFolder` is not used |
|**amcv**|Append missing collection variables|Appends missing collection variables that are refferenced in all requests but are not present in the collection. With this command, the `sourceFolder` is not used|
> Commands can be combined by executing them one after the other and using the output collection of the first execution as a source collection of the next execution.


## NOTES
- The application will only append Collection Variables in the Output collection 
- You can use the Output collection as a Start collection, in this case only the new variables will be added and the Start collection **will be overwritten**
- Source of Collection Variables/Requests are all the collections located in the Source folder
- Duplicate (name and value) variables will not be added in the collection multiple times
- If values are different in two same named variables then both will be added to the Output collection
- Empty variables are not added 
- When using **ts** command, the source collection must have saved responses as [examples](https://learning.postman.com/docs/sending-requests/responses/), otherwise the generation does not work, there is nothing go analyze
- When using the t* commands, the source collection is not altered in any way other than appending test assertions in the `Test` part of ***requests only***. The assertions are added beside existing `Test` code.
- This application does not alters source collections, the changes are only streamed to the output collection.
- The `mev` command works with environment files, both the source and the output files ***are not*** collection files, but [Postman environment files](https://learning.postman.com/docs/sending-requests/managing-environments/)