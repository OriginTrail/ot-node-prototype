var restify = require('restify');
var aql = require('aql');
var business_location = require('./modules/business_location');
var product = require('./modules/product');
var importer = require('./modules/importer'); 
var sanitize = require("sanitize-filename");
var http = require('http');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const server = restify.createServer({
    name: 'origintrail_IPC node',
    version: '0.1.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());


/* API calls */

// Get all business locations
server.get('/business_locations', function (req, res) {
    business_location.getLocations(function(data){
        res.send(data);
    });
});

// Get business location by unique identifier
server.get('/business_locations/id/:id', function (req, res) {
    business_location.getLocationById(req.params.id, function(data){
        res.send(data);
    });
});

/* API calls for Products  */

// Get all products
server.get('/products', function (req, res) {
    product.getProducts(function(data){
        res.send(data);
    });
});

// Get products by unique identifier
server.get('/products/id/:id', function (req, res) {
    product.getProductById(req.params.id, function(data){
        res.send(data);
    });
});

// Get products by unique identifier
server.get('/products/category/:cat', function (req, res) {
    product.getProductByCategory(req.params.id, function(data){
        res.send(data);
    });
});

// Get product batch trail by unique identifier
server.get('/trails/batch/id/:batchId', function (req, res) {
    product.getProductBatchTrailById(req.params.batchId, function(data){
        if(data.length == 0)
        {

            http.get({
                port: config.RPC_API_PORT,
                path: `/remote/batch/id/${req.params.batchId}`,
                method: 'GET',
                agent: false
            }, (response) => {
                str = '';
                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    res.send(JSON.parse(str))
                });
            });
        }else
        {
            res.send(data);
        }
    });
});

// API calls from RPC API

server.get('/remote/trails/batch/id/:batchId', function (req, res) {
    product.getProductBatchTrailById(req.params.batchId, function(data){
        res.send(data);
    });
});


// API calls from localhost

// Get product batch trail by ean13 and expiration date
server.get('/trails/batch/ean13/:ean13/exp/:exp', function (req, res) {
    product.getProductBatchTrailByEan13Exp(req.params.ean13, req.params.exp, function(data){
        res.send(data);
    });
});

// File import, file: importfile
server.post('/import', function (req, res) {    
    if(req.files == undefined || req.files.importfile == undefined){
        res.send({status: 400, message: 'Input file not provided!'});
    }else{
        input_file = req.files.importfile.path;
        importer.import(input_file, function(data){
            res.send(data);
        });
    }
});

server.listen(parseInt(config.IPC_API_PORT), 'localhost', function () {
   console.log('%s listening at %s', server.name, server.url);
});