module.exports = {
    
        // Global similarity of objects
        calculateSimilarity: function(obj1, obj2)
        {
            if(obj1.uid != obj2.uid)
                return 0;
            
            obj1_data = obj1.data;
            obj2_data = obj2.data;
            
            obj1_keys_count = 0;
            obj2_keys_count = 0;
            
            obj1_keys = [];
            obj2_keys = [];
            
            for(i in obj1_data)
            {
                obj1_keys_count++;
                obj1_keys.push({key: i, value: obj1_data[i]});
            }
            
            for(i in obj2_data)
            {
                obj2_keys_count++;
                obj2_keys.push({key: i, value: obj2_data[i]});
            }
            
            if(obj1_keys_count == 0 && obj2_keys_count == 0)
            {
                return 2;
            }
            
            var SimilarityMatrix = [];
            
            for(var i = 0; i <= obj1_keys_count; i++)
            {
                SimilarityMatrix[i] = [];
                SimilarityMatrix[i][0] = 0;
            }
            
            for(var j = 0; j <= obj2_keys_count; j++)
            {    
                SimilarityMatrix[0][j] = 0;
            }
            
            for(var i = 1; i <= obj1_keys_count; i++)
                for(var j = 1; j <= obj2_keys_count; j++)
                {
                    SimilarityMatrix[i][j] = Math.max(SimilarityMatrix[i-1][j], SimilarityMatrix[i][j-1], SimilarityMatrix[i-1][j-1] + compareObjects(obj1_keys[i-1], obj2_keys[j-1]))
                }

            return SimilarityMatrix[obj1_keys_count][obj2_keys_count] / (2.0 * Math.min(obj1_keys_count, obj2_keys_count));
        }
        
}

function compareObjects(obj1, obj2)
{
    if(obj1.key != obj2.key)
        return 0;
    
    return 1 + (obj1.value == obj2.value);
}