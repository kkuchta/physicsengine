// Lets keep it idempotent up in here.
Utils = (function(){

var pub = {
    generateGUID : function(){
        // From stack overflow, a js guid (or close enough for us).
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
};

return pub;
})();
