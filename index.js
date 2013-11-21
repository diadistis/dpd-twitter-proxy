var 
    Resource = require('deployd/lib/resource'), 
    util = require('util'),
    https = require('https'),
    OAuth2 = require('OAuth').OAuth2,
    url = require('url');

function TwitterProxy(name, options) {
    Resource.apply(this, arguments);
}

util.inherits(TwitterProxy, Resource);

module.exports = TwitterProxy;

TwitterProxy.prototype.clientGeneration = true;

TwitterProxy.prototype.handle = function (ctx, next){
    if(ctx.req && ctx.req.method !== 'GET') return next();

    var oauth2 = new OAuth2(this.config.consumerKey, this.config.consumerSecret, 'https://api.twitter.com/', null, 'oauth2/token', null);

    oauth2.getOAuthAccessToken('', {
        'grant_type': 'client_credentials'
    }, function (e, access_token) {
        
        if(!access_token) ctx.res.end();
        
        var urlObj = url.parse('/1.1/search/tweets.json');
        urlObj.query = ctx.query;        
        urlObj = url.parse(url.format(urlObj));
        
        var options = {
            hostname: 'api.twitter.com',
            path: urlObj.path,
            headers: {
                Authorization: 'Bearer ' + access_token
            }
        };
     
        var request = https.get(options, function (result) {
            result.setEncoding('utf8');
            result.on('data', function (data) {
                ctx.res.write(data);
            });
            result.on('end', function () {
                ctx.res.end();
            });
        });
        
        request.on('error', function(e) {
            ctx.res.end();
        });        
    });
};

TwitterProxy.basicDashboard = {
  settings: [
  {
    name        : 'consumerKey',
    type        : 'text',
    description : 'Twitter Consumer Key'
  }, {
    name        : 'consumerSecret',
    type        : 'text',
    description : 'Twitter Consumer Secret'
  }]
};
