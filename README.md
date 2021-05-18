# Jackal tools
Jackal tools is an utility application that manipulates `Postman collections`.

This application has multiple features distinguished by the `mode` parameter (see below).
It combines collection items from [Postman](https://www.postman.com/) collections located in the `source` folder and appends into the `target` collection. All current features work as aggregations and produce: ***one output collection from many source collections***. 

## How to use it

To run the application just execute the application with the correct command line arguments

### As npm module

```bash
npm i jackal-postman-tools -g

jackal -m [mode] -f [source-folder] -s [start-collection] -o [output-collection]
```

### As node application from source

```bash
node index.js -m [mode] -f [source-folder] -s [start-collection] -o [output-collection]
```

> NOTE: start-collection argument is optional, if not specified a new postman collection will be created

## Mode options

|Mode   |Meaning   |Behavior   |
|---|---|---|
|**merge-variables**  |Merge collection variables  |Merges all variables from all source folder collections in the collection variables of the output collection   |
|**merge-requests**   |Merge collection requests   |Merges all requests from all source folder collections into the output collection, collection variables are not transfered, only requests  |
|**merge-collection** |Merge collection in folders |Merges each collection requests from all collections (from the source folder) in a separate folder in the output collection. Collection variables in this mode are setup in the PreRequest script of each requests folder|
|**test-http200**     |Append test assertions      |Adds test asserts (to check if response HTTP code is 200) to all requests of the source collection and saves to the output collection. In this mode, the -f flag is not used 

> Modes can be combined by executing them one after the other and using the output collection of the first execution as a source collection of the next exection.

Examples:

```Bash
jackal -f ./examples -o outTemp.json -m merge-requests
jackal -f ./examples -s outTemp -o out.json -m merge-variables
jackal -m test-http200 -s "./examples/Sample With variables 2.postman_collection.json" -o out.json
```


## After the execution

```Bash
      _                  _              _ 
     | |   __ _    ___  | | __   __ _  | |
  _  | |  / _` |  / __| | |/ /  / _` | | |
 | |_| | | (_| | | (__  |   <  | (_| | | |
  \___/   \__,_|  \___| |_|\_\  \__,_| |_|

Source collections folder > ./examples
Start collection to be upgraded > Blank collection
Target collection > test.json
Mode > merge-requests
---------------------------------------------------------------------
Processing source file: Sample With variables 2.postman_collection.json
Processing source file: Sample With variables.postman_collection.json  
---------------------------------------------------------------------  
Merge fiinished successfully
---------------------------------------------------------------------   
```
and the Output collection will be populated with the aggregated variables

## NOTES
- The application will only append Collection Variables in the Output collection 
- You can use the Output collection as a Start collection, in this case only the new variables will be added and the Start collection **will be overwritten**
- Source of Collection Variables are all the collections located in the Source folder
- Duplicate (name and value) variables will not be added in the collection multiple times
- If values are different in two same named variables then both will be added to the Output collection
- Empty variables are not added 
- When using the test-* modes, the source collection is no altered in any way other than adding testing assertions in the `Test` part of ***requests only***. The assertions are added beside existing `Test` code.
- This application does not remove features from collections