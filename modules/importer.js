var call_process = require("child_process").exec;
var utilities = require('./utilities');
var blockchain = require('./blockchain');
var similarity = require('./similarity');
const crypto = require('crypto');
const hash = crypto.createHash('sha256'); // should be sha3
var fs = require('fs');
var config_file = fs.readFileSync('./config.json');

module.exports = {
  import: function (input_file, callback) {
    var process = call_process('python3 importer.py ' + input_file, function (error, stdout, stderr){
        if (stderr.length != 0){
            utilities.execute_callback(callback,{
                status: 400, 
                message: stderr
            });
        }else{
            result = JSON.parse(stdout);
            batches = result.batches;
            transferEvents = result.transferEvents;
            var batch_graph;

            
            for(i in batches){
                
                if(batches[i]['id'] == undefined)
                {
                    continue;
                }
                else
                {
                    var idBatch = batches[i]['id']
                    utilities.traverseById(idBatch, function(batch_graph){
                        graph_hash = utilities.sha3(JSON.stringify(batch_graph));
                        batch_id_hash = utilities.sha3(idBatch)
                        blockchain.addFingerprint(id, batch_id_hash, graph_hash);
                    });   
                }
            } 
            
                    
            for(i in transferEvents)
            {
                
                var id = transferEvents[i]['id']
                var excluded =  transferEvents[i]['_key']
                utilities.traverse(excluded, function(newEvent)
                {
                    utilities.traverseById(id, function(oldEvent)
                    {
                        if(oldEvent.length != 0)
                        {
                            consensus = 0;
                            
                            for(var i = 0; i < newEvent.length; i++)
                                consensus += similarity.calculateSimilarity(newEvent[i], oldEvent[i])
                            
                            console.log('Event ' + id + ' consensus: ' + (consensus * 100) + '%');
                        }
                    }, excluded, true)
                
                    
                }, 'v==v', true)
                
            }
                
            console.log('Import complete');
                
            utilities.execute_callback(callback,{
                status: 200, 
                message: "Import complete"
            });
        }
    });
}
};