# Jackal tools
Jackal tools is an utility application that manipulates `Postman collections`.

This application combines all collection variables from postman collections located in the `source` folder and adds into the `target` collection

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
|**merge-variables**   |Merge collection variables  |Merges variables from all source folder collection in the collection variables of the output collection   |
|**merge-requests**   |Merge collection requests   | Merges all requests from all source folder collection into the output collection, collection variables are not transfered, only requests  |

> Modes can be combined by executing them one after the other and using the output collection of the first execution as a source collection of the next exection.

Example:

```Bash
jackal -f ./examples -o outTemp.json -m merge-requests
jackal -f ./examples -s outTemp -o out.json -m merge-variables
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