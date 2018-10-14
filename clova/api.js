var request = require('request');

module.exports = function (callee) {
    
    function API_Call(callee) {
        var OPTIONS = {
            headers: {'Content-Type': 'application/json'},
            url: null,
            body: null
        };
        
        const PORT = '9999';
        const BASE_PATH = '';
        var HOST = null;
        
        (function () {
            switch (callee) {
                case 'dev':
                    HOST = 'https://dev-api.com';
                    break;
                case 'prod':
                    HOST = 'https://prod-api.com';
                    break;
                case 'another':
                    HOST = 'http://175.195.89.200';
                    break;
                default:
                    HOST = 'http://localhost';
            }
        })(callee);
        
        return {
            
            getKhuAss : function (id, pw, callback) {
                OPTIONS.url = HOST + ':' + PORT + BASE_PATH + '/board';
                OPTIONS.body = JSON.stringify({
                    "id": id,
                    "pw": pw
                });

                request.post(OPTIONS, function (err, res, result) {
                    statusCodeErrorHandler(res.statusCode, callback, result);
                });
            }
        };
    }
    
    function statusCodeErrorHandler(statusCode, callback , data) {
        switch (statusCode) {
            case 200:
                callback(null, JSON.parse(data));
                break;
            default:
                callback('error', JSON.parse(data));
                break;
        }
    }
    
    var INSTANCE;
    if (INSTANCE === undefined) {
        INSTANCE = new API_Call(callee);
    }
    return INSTANCE;
};