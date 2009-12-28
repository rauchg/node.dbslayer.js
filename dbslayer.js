/*
---
name: dbslayer.js

description: Interface to DBSlayer for Node.JS

author: [Guillermo Rauch](http://devthought.com)
...
*/

var sys = require('sys'),
    http = require('http'),
    
    booleanCommands = ['STAT', 'CLIENT_INFO', 'HOST_INFO', 'SERVER_VERSION', 'CLIENT_VERSION'],

Server = this.Server = function(host, port, timeout){
  this.host = host || 'localhost';
  this.port = port || 9090;
  this.timeout = timeout;
};

Server.prototype.fetch = function(object, key){
  var connection = http.createClient(this.port, this.host),
      request = connection[connection.get ? 'get' : 'request']('/db?' + escape(JSON.stringify(object)), {'host': this.host}),
      promise = new process.Promise();
  
  promise.timeout(this.timeout);

  request.finish(function(response){
    response.addListener('body', function(data){  
      try {
        var object = JSON.parse(data);
      } catch(e){
        return promise.emitError(e);
      }      
      
      if (object.MYSQL_ERROR !== undefined){
        promise.emitError(object.MYSQL_ERROR, object.MYSQL_ERRNO);
      } else if (object.ERROR !== undefined){
        promise.emitError(object.ERROR);
      } else {
        promise.emitSuccess(key ? object[key] : object);
      }      
    });
  });
  
  return promise;
};

Server.prototype.query = function(query){
  return this.fetch({SQL: query}, 'RESULT');
};

for (var i = 0, l = booleanCommands.length; i < l; i++){
  Server.prototype[booleanCommands[i].toLowerCase()] = (function(command){
    return function(){
      var obj = {};
      obj[command] = true;
      return this.fetch(obj, command);
    };
  })(booleanCommands[i]);
}