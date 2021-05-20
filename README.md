# Jackal tools
Jackal tools is an utility application that manipulates `Postman collections`.

This application has multiple features distinguished by the `command` parameter (see below).
It combines collection items from [Postman](https://www.postman.com/) collections located in the `source` folder and appends into the `target` collection. The application is mainly focused on collection feature aggregations, and maintenance of single collections. 
All merge commands are using ***one output collection from many source collections***, and the rest of the commands are ***one input collection to one output collection***.

## How to use it

To run the application just execute the application with the correct command line arguments

### As npm module

```bash
npm i jackal-postman-tools -g

jackal [command] -f [source-folder] -s [start-collection] -o [output-collection]
```

### As node application from source

```bash
node index.js [command] -f [source-folder] -s [start-collection] -o [output-collection]
```

> NOTE: start-collection argument is optional, if not specified a new postman collection will be created

## Commands options

|Command   |Meaning   |Behavior   |
|---|---|---|
|**mv**  |Merge collection variables  |Merges all variables from all source folder collections in the collection variables of the output collection   |
|**mr**   |Merge collection requests   |Merges all requests from all source folder collections into the output collection, collection variables are not transfered, only requests  |
|**mc** |Merge collection in folders |Merges each collection requests from all collections (from the source folder) in a separate folder in the output collection. Collection variables with this command are setup in the PreRequest script of each requests folder|
|**t200**     |Append test assertions      |Adds test asserts (to check if response HTTP code is 200) to all requests of the source collection and saves to the output collection. With this command, the -f flag is not used 
|**clr**          |Remove duplicate requests   |All repeating occurences of absolutely the same requests (including name) will be removed, only one will remain. The remaining instance is the first occurence that the cleanup algorithm encounters while analysing. Scope of comparing duplicates is the whole collection with all folders and subfolders. With this command, the -f flag is not used |

> Commands can be combined by executing them one after the other and using the output collection of the first execution as a source collection of the next exection.

Example:

```Bash
jackal mr -f ./examples -o outTemp.json
jackal mv -f ./examples -s outTemp -o out.json
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
Command > merge-requests
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
- Source of Collection Variables/Requests are all the collections located in the Source folder
- Duplicate (name and value) variables will not be added in the collection multiple times
- If values are different in two same named variables then both will be added to the Output collection
- Empty variables are not added 
- When using the t200 command, the source collection is not altered in any way other than appending test assertions in the `Test` part of ***requests only***. The assertions are added beside existing `Test` code.
- This application does not alters source collections, the changes are only streamed to the output collection. 