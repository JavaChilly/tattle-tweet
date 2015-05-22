var config = require( './config' );

var http = require( 'http' ),
    path = require( 'path' ),
       _ = require( 'underscore' );

var WORKER_INTERVAL = 60000; // default, moved to options
var exports = module.exports;

exports.workerAgent = function( serviceName, options, next ) {
  var instanceConfig = _.extend( config, options || {} );

  var workerInterval = _.has( instanceConfig, 'interval' ) ? instanceConfig['interval'] : WORKER_INTERVAL;

  var app = function( periodicFunction ) {
    setInterval( periodicFunction, workerInterval );
    periodicFunction();
    require( './logger' ).info( serviceName + ' checking every ' + ( workerInterval / 1000 ) + ' seconds' );
  };

  if ( next ) {
    next( null, app );
  }
};