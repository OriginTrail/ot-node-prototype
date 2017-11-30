var utilities = require('../../utilities');
var config = utilities.getConfig();
var IOTA = require('iota.lib');

function dataURIToTrytes(dataURI) {
	return iota.utils.toTrytes(dataURI);
}

/**
  Formats the batch id and hash according to the need of the Iota transaction
  */

  function createTransactionObj(batch_hash, batch_id, graph_hash,address) {
  	let trytes = dataURIToTrytes(batch_id + '|BH:' + batch_hash+ '|GH:'+graph_hash);
  	if (!trytes) {
  		throw new Error('Invalid batch_id or batch_hash?');
  	}	
  	return {
  		'address': address,
  		'value': 0,
  		'message': trytes,
  		'tag': 'IOTASTORE',
  	};
  }


/**
 * sends an array of transactions
 * @param {Array.<IOTA_TRANSACTIONS>} txs transaction array
 * @param {String} seed seed from which to send
 * @return {Promise.<Object>}
 */
 function sendTransactions(txs, seed) {
 	console.log('sending tx');
 	return new Promise(function(resolve, reject) {
 		iota.api.sendTransfer(seed, 4, 14, txs, function(error, transaction) {
 			if (error) {
 				reject(error);
 			} else {
 				resolve(transaction[0].bundle);
 			}
 		});
 	});
 }

/**
 * Stores the hash and batch id in the tangle
 */
 function storeDataInTangle(batch_id,batch_id_hash, graph_hash) {
 	let tx = createTransactionObj(batch_id_hash, batch_id, graph_hash, address);

 	sendTransactions(tx, seed).then(function(result) {
 		console.log(result);
 	});

 }

 module.exports = function (){

 	const MAX_TRYTES = 2187;

 	let seed = config.blockchain.settings.iota.seed;
 	let iota = new IOTA({
 		provider: config.blockchain.settings.iota.provider, 
 	});

 	var interface = {
 		addFingerprint : storeDataInTangle,
 	};

 	return interface; 
 }