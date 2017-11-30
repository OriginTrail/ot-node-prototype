var kad = require('kad');
var http = require('http');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var utilities = require('./modules/utilities');
var blockchain = require('./modules/blockchain');
var getIP = require('ipware')().get_ip
var restify = require('restify');
var leveldup = require('levelup');
var leveldown = require('leveldown');
var async = require('async');
const quasar = require('kad-quasar');
const publicIp = require('public-ip');
const crypto = require('crypto');
const hash = crypto.createHash('sha256');


var activeLocalRequest = null;
var activeRequestId = null;

const server = restify.createServer({
    name: 'origintrail RPC node',
    version: '0.1.0'
});

const seed = ['0000000000000000000000000000000000000001', { hostname: config.KADEMLIA_SEED_IP, port: KADEMLIA_SEED_PORT }];


server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const node = kad({
    transport: new kad.HTTPTransport(),
    storage: require('levelup')(leveldown('kad-storage')),
    contact: { hostname: config.NODE_IP, port: config.KADEMLIA_PORT }
});

node.plugin(quasar);

node.join(seed, function() {
    if(node.router.size != 0){
        console.log('Connected to seed')
    }
    else{
        console.log('Connection to seed failed')
    }
});

node.listen(config.KADEMLIA_PORT, function(){
    console.log('listening...');
    
    server.listen(parseInt(config.RPC_API_PORT), 'localhost', function () {
        console.log('%s listening at %s', server.name, server.url);
    });
    
    node.quasarSubscribe('ot-discover', (content) => {
        processBroadcast(content)
    });
});


server.get('/batch/id/:bid', function (req, res) {

    if(!utilities.validId(req.params.bid)){
        res.send({status: 400, data: [], message: "Invalid batch ID"});
    }
    else{
        http.get({
            port: parseInt(config.IPC_API_PORT),
            path: '/remote/trails/batch/id/' + req.params.bid,
            method: 'GET',
            agent: false
        }, (response) => {
            str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                res.send(JSON.parse(str));
            });
        });
    }
});


server.get('/batch/ean13/:ean13/exp/:exp', function (req, res) {

    let ean13 = req.params.ean13;
    let exp = req.params.exp;

    if(!utilities.validEan13(ean13) || !utilities.validDate(exp)){
        res.send({status: 400, data: [], message: "Invalid batch parameters"});
    }
    else{

        http.get({
            port: parseInt(config.IPC_API_PORT),
            path: `/trails/batch/ean13/${ean13}/exp/${exp}`,
            method: 'GET',
            agent: false
        }, (response) => {
            str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                res.send(JSON.parse(str));
            });
        });

    }
});

server.get('/remote/batch/id/:bid', function (req, res) {
    request_ip = getIP(req).clientIp;
    
    var requestTimeout
    
    if(request_ip != '127.0.0.1'){
    res.send();
}
else{

    bid = req.params.bid;

    activeLocalRequest = res;
    activeRequestId = config.WALLET_ID + '-' + bid + '-' + Date.now();
    
    node.quasarPublish('ot-discover', {
        message_type: 'BATCH_FIND_REQUEST',
        content_type: 'BATCH_ID',
        request_id: activeRequestId,
        bid: bid,
        wallet: config.WALLET_ID,
        ip: config.NODE_IP
    });
};

requestTimeout = setTimeout(function(){
    if(activeLocalRequest != null){
        res.send([]); 
    }
    return;
}, parseInt(config.REQUEST_TIMEOUT))

});


function processBroadcast(content){
    if(content.ip == config.NODE_IP && content.port == config.RPC_API_PORT){
    return;
}

if(content.message_type == 'BATCH_FIND_REQUEST'){
    if(content.content_type == 'BATCH_ID'){
        hasBatch = utilities.hasBatchId(content.bid, function(batch_found){
            if(batch_found){
                node.quasarPublish('ot-discover', {
                    message_type: 'BATCH_FIND_RESPONSE',
                    content_type: 'REQUEST_ID',
                    request_id: content.request_id,
                    wallet: config.WALLET_ID,
                    ip: config.NODE_IP,
                    port: config.RPC_API_PORT,
                    bid: content.bid
                });
            };
        });
    };
}else if(content.message_type == 'BATCH_FIND_RESPONSE'){
    blockchain.getFingerprint(content.wallet, content.bid, function(graph_hash){
        if(graph_hash){
            if(activeRequestId != null && activeRequestId == content.request_id){
                activeRequestId = null;                
                
                http.get({
                    host: content.ip,
                    port: content.port,
                    path: `/batch/id/${content.bid}`,
                    method: 'GET',
                    agent: false
                }, (response, err) => {

                    str = '';
                    response.on('data', function (chunk) {
                        str += chunk;
                    });

                    response.on('end', function () {
                        if(activeLocalRequest != null){                                  
                            data = JSON.parse(str)
                            batch_hash = hash.update(JSON.stringify(data));

                            var isValidHash = blockchain.checkHash(wid, bid, batch_hash);

                            if(isValidHash){
                                tmpReq = activeLocalRequest;
                                activeLocalRequest = null;
                                tmpReq.send(data);
                            }else{
                                tmpReq.send({
                                    status: 400,
                                    message: "Hash not valid!",
                                    data: ""
                                });
                            }
                        }
                    });
                });
            }
        }
    });
  }
}
