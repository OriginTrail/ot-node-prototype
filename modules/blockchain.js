var utilities = require('./utilities');
var config = utilities.getConfig();
var chain = config.blockchain.preferred_chain;
var chainInterface = null;
console.log(chain);

// var a = require( "./blockchain_interface/ethereum/interface.js");
switch (chain){
  case "ethereum":
  case "iota":
  case "neo":
    chainInterface = require( "./blockchain_interface/"+ chain +"/interface.js")(config);
  break;
  default: 
    chainInterface = null;
    console.log("ERROR: Couldn't load blockchain interaface, please check your config file.");
}

 

module.exports = {
  addFingerprint: function(wid, hash, id){
    chainInterface.addFingerprint(wid,hash,id);
  },
  
  getFingerprint: function(wid, bid, callback){
      
      // Placeholder function, check if bid is associated with bid
      // TODO: napravimo batch_id_hash
      var fingerprint = chainInterface.getFingerprint(wid,batch_id_hash);
      utilities.execute_callback(callback,fingerprint);
      return true;
    },

    checkHash: function(wid, batch_id, graph){
        
      // Placeholder function, check ih bid hash is correct
      var batch_id_hash = utilities.sha3(batch_id);
      var graph_hash = utilities.sha3(graph);
      var fingerprint = chainInterface.getFingerprint(wid,batch_id_hash);

      if (!fingerprint){
        console.log('No valid fingerprint found');
      }
      return fingerprint == graph_hash;
    }
  };
