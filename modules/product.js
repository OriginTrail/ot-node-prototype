var utilities = require('./utilities');

module.exports = {
  getProducts: function (callback) {
    utilities.runQuery(`
        FOR u IN ot_vertices
        FILTER u.vertex_type == "PRODUCT"
        RETURN u
        `, function(result){
            utilities.execute_callback(callback,result);
        });
},
getProductById: function (id, callback) {

    if(!utilities.validId(id))
    {
        utilities.execute_callback(callback,[]);
    }
    else
    {
        utilities.runQuery(`
            FOR u IN ot_vertices 
            FILTER u.uid == "${id}" and u.vertex_type == "PRODUCT"
            RETURN u
            `, function(result){
                utilities.execute_callback(callback,result);
            });
    }
},
getProductByCategory: function (category, callback) {

    if(!utilities.validId(category)){
        utilities.execute_callback(callback,[]);
    }
    else{
        utilities.runQuery(`
            FOR u IN ot_vertices 
            FILTER u.data.category == "${category}" and u.vertex_type == "PRODUCT"
            RETURN u
            `, function(result){
               utilities.execute_callback(callback,result);
           });
    } 
},
getProductBatchTrailById: function (batchId, callback) {
    utilities.traverseById(batchId, function(path){
       utilities.execute_callback(callback,path);
   });
},

getProductBatchTrailByEan13Exp: function (ean13, exp, callback) {
    utilities.traverseByEan13Exp(ean13, exp, function(path){
        utilities.execute_callback(callback,path); 
    });
}

};