/*
---
name: tools.js

description: <
  This is a demonstration of how dbslayer.js can be used.
  It takes three parameters from the SQL query, a host

author: [Guillermo Rauch](http://devthought.com)
...
*/

var sys = require('sys')
    dbslayer = require('./dbslayer'),    
    sql = process.ARGV[2],
    db = new dbslayer.Server();
    
if (!sql){
  sys.puts('Please provide the SQL query');
  return;
}

db.query(sql)
  // on success
  .addCallback(function(result){
    sys.puts('-------------------------');        
    for (var i = 0, l = result.ROWS.length; i < l; i++){
      sys.puts('Row ' + i + ': ' + result.ROWS[i].join(' '));
    }
  })
  
  // on error :(
  .addErrback(function(error, errno){
    sys.puts('-------------------------');        
    sys.puts('MySQL error (' + (errno || '') + '): ' + error);
  });

['stat', 'client_info', 'host_info', 'server_version', 'client_version'].forEach(function(command){  
  db[command]().addCallback(function(result){
    sys.puts('-------------------------');    
    sys.puts(command.toUpperCase() + ' ' + result);
  });
});