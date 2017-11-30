var Database = require('arangojs').Database;
var fs = require('fs');
var config_file = fs.readFileSync('./config.json')
var config = JSON.parse(config_file);
var sha3 = require('solidity-sha3').default; // same as solidity sha3
username = config.DB_USERNAME
password = config.DB_PASSWORD
host = config.DB_HOST
port = config.DB_PORT
database = config.DB_DATABASE
MAX_PATH_LENGTH = parseInt(config.MAX_PATH_LENGTH)

const db = new Database();
db.useDatabase(database);
db.useBasicAuth(username, password);

module.exports = {

    getConfig: function(){
        return config;
    },
    runQuery: function(queryString, callback)
    {
     runQuery(queryString, callback);
 },

 validId: function(id)
 {
     return validId(id);
 },

 validEan13: function(ean13)
 {
    return validEan13(ean13);
},

validDate: function(date)
{
    return validDate(date);
},

traverse: function(startNode, callback, filter='v==v', vertices_only = false)
{
    traverse(startNode, callback, filter, vertices_only)
},

traverseById: function(id, callback, exclude = '', vertices_only = false)
{
 traverseById(id, callback, exclude = '', vertices_only = false)
},

traverseByEan13Exp: function(ean13, exp, callback)
{
    traverseByEan13Exp(ean13, exp, callback);
},

hasBatchId: function(batch_id, callback)
{
    return hasBatchId(batch_id, callback);
},
execute_callback: function(callback,callback_input){
   execute_callback(callback, callback_input);
},
sha3: function(value){
    return sha3(value);
}
}

function validEan13(ean13)
{
    var regexp = /[\d]{13}/gi;
    return ean13.match(regexp);
}

function validDate(date)
{
    var regexp = /^[\d]{4}-[\d]{2}-[\d]{2}$/gi;
    return date.match(regexp);
}

function runQuery(queryString, callback)
{

    db.query({
        query: queryString,
        
    }, function (err, cursor) {
        if (err) {
            console.log(err);
        } 
        else {
            callback(cursor._result);
        }
    }
    );
}

function traverse(startNode, callback, filter = 'v==v', vertices_only = false)
{
    var regexp = /^[a-z0-9]+$/gi
    
    if(!startNode.match(regexp))
    {
        execute_callback(callback, [])
    }
    else
    {
        startNodeId = 'ot_vertices/' + startNode;

        queryString = `
        FOR v, e, p IN 1 .. ${MAX_PATH_LENGTH}
        OUTBOUND '${startNodeId}'
        GRAPH 'origintrail_graph'
        FILTER ${filter}`
        
        if(vertices_only)
            queryString += ` RETURN v`
        else
            queryString += ` RETURN p`
            
        runQuery(queryString, function(data){
            callback(data);
        });
    }
}

function validId(id){
    var regexp = /^[\w\d_: -]+$/gi;
    return id.match(regexp);
}

function traverseByEan13Exp(ean13, exp, callback)
{
    if(!validEan13(ean13) || !validDate(exp))
    {
        callback([])
    }
    else
    {

        queryString = `
        FOR v IN ot_vertices
        FILTER v.data.ean13 == ${ean13} and v.data.expirationDate == '${exp}'
        RETURN v._key
        `

        runQuery(queryString, function(data){
            if(data.length == 0)
                callback([])
            else
            {
                traverse(data[0], callback);
            }
        });
    }
}

function traverseById(id, callback, exclude = '', vertices_only = false)
{
    if(!validId(id) || (exclude.length != 0 && !validId(exclude)))
    {
        execute_callback(callback, []);
        return;
    }
    else
    {
        
        queryString = `
        FOR v IN ot_vertices
        FILTER v.id == "${id}"
        ` 
         
         if(exclude.length != 0)
             queryString += ` AND v._key != "${exclude}" `
         
         queryString += `RETURN v._key`

        runQuery(queryString, function(data){
            if(data.length == 0)
                callback([])
            else
            {
                traverse(data[0], callback, vertices_only);
            }
        });
    }
}

function hasBatchId(batch_id, callback)
{    
    if(!validId(batch_id))
    {
        callback(false)
    }
    else
    {

        queryString = `
        FOR v IN ot_vertices
        FILTER v.id == "${batch_id}"
        RETURN v.id
        `

        runQuery(queryString, function(data){
            found = data.length != 0;
            callback(found);
        });
    }
}

function execute_callback(callback, callback_input)
{
 if (typeof callback === "function"){
        callback(callback_input);    
    }else{
        console.log("Callback not defined!");
    }
}