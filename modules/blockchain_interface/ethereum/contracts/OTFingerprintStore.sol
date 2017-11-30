pragma solidity ^0.4.18;

import './ownership/Ownable.sol';


contract OTFingerprintStore is Ownable{

	/* utilities */
	uint256 private weekInSeconds = 86400 * 7;
	uint256 public _version;

	/* Data Holder Fingerprint Store */ 
	mapping(address => mapping (bytes32 => bytes32)) public DHFS; 

	event Fingerprint(address indexed dataHolder, string indexed batch_id, bytes32 batch_hash, bytes32 graph_hash);

	function OTFingerprintStore(uint256 version){
		_version = version;
	}

	function getVersion() public constant returns (uint256){
		return _version;
	}

  function bytes32ToString(bytes32 data) returns (string) {
    bytes memory bytesString = new bytes(32);
    for (uint j=0; j<32; j++) {
      byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
      if (char != 0) {
        bytesString[j] = char;
      }
    }
    return string(bytesString);
  }
	/* Fingerprinting */

	/* Store a fingerpring of a graph identified by batch_id and hash of batch_id */
	function addFingerPrint(string batch_id, bytes32 batch_hash, bytes32 graph_hash) public returns (bool){
		require(msg.sender!=address(0));
		DHFS[msg.sender][batch_hash]= graph_hash;
		Fingerprint(msg.sender,batch_id,batch_hash,graph_hash);		
	}

	function getFingerprintByBatchHash(address dataHolder, bytes32 batch_hash) public constant returns (bytes32 fingerprint){
		require(dataHolder!=address(0));
		return DHFS[dataHolder][batch_hash];
	}


}
