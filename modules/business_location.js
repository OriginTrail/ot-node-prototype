var utilities = require('./utilities')

module.exports = {
  getLocations: function (callback) {
    utilities.runQuery(`
        FOR u IN ot_vertices
        FILTER u.vertex_type == "BUSINESS_LOCATION"
        RETURN u
    `, function(result){
        utilities.execute_callback(callback,result);
    });
  },
  getLocationById: function (id, callback) {
    
    if(!utilities.validId(id))
    {
        utilities.execute_callback(callback,[]);
    }
    else
    {
        utilities.runQuery(`
            FOR u IN ot_vertices 
            FILTER u.uid == "${id}" and u.vertex_type == "BUSINESS_LOCATION"
            RETURN u
        `, function(result){
            utilities.execute_callback(callback,result);
        });
    }
    
  } 
};