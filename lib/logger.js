var config = require( './config' ),
    colors = require( 'colors' ),
    format = require( './dateformat' ),
    util = require( 'util' );

var debugEnabled = true;
if ( config.node.mode === 'production' ) {
  debugEnabled = false;
}

var NamespacedLogger = function NamespacedLogger(_name) {
  this.namespace = _name.bold.white + ' ';
};
NamespacedLogger.prototype.namespace = '';

NamespacedLogger.prototype.prefix = function( type ) {
  var nowStr = format(new Date(), format.masks.isoDateFormat );
  return nowStr + ' [' + type + '] ' + this.namespace;
};

NamespacedLogger.prototype.logMessage = function( type, msg, meta ) {
  if ( meta ) {
    console.log(this.prefix( type ), msg, meta );
  } else {
    console.log(this.prefix( type ), msg );
  }
};

NamespacedLogger.prototype.logErrorMessage = function( type, msg, meta ) {
  if ( meta ) {
    console.error(this.prefix( type ), msg, meta );
  } else {
    console.error(this.prefix( type ), msg );
  }
};

NamespacedLogger.prototype.inspect = function( thing ) {
  console.dir( thing );
};

NamespacedLogger.prototype.warn = function( msg, meta ) {
  this.logErrorMessage( 'warn '.yellow, msg, meta );
};

NamespacedLogger.prototype.error = function( msg, meta ) {
  this.logErrorMessage( 'error'.red, msg, meta );
  if ( meta ) {
    this.logErrorMessage( 'error'.red, util.inspect( meta ) );
  }
};

NamespacedLogger.prototype.info = function( msg, meta ) {
  this.logMessage( 'info '.cyan, msg, meta );
};

NamespacedLogger.prototype.log = function( msg, meta ) {
  if ( debugEnabled ) this.logMessage( 'debug'.green, msg, meta );
};

NamespacedLogger.prototype.debugging = function() {
  return debugEnabled;
};

NamespacedLogger.prototype.debug = function( msg, meta ) {
  if ( debugEnabled ) {
    this.logMessage( 'debug'.green, msg, meta );
    if ( meta ) {
      this.inspect( meta );
    }
  }
};

var root = new NamespacedLogger('root');

// continue to export functions available to message against the singleton instance (root) logger
var exports = module.exports;

exports.inspect = function( thing ) {
  root.inspect( thing );
};

exports.log = function( msg, meta ) {
  root.log( msg, meta );
};

exports.debug = function( msg, meta ) {
  root.debug( msg, meta );
};

exports.info = function( msg, meta ) {
  root.info( msg, meta );
};

exports.error = function( msg, meta ) {
  root.error( 'error', msg);
  if ( meta ) {
    root.error( util.inspect( meta ) );
  }
};

exports.warn = function( msg, meta ) {
  root.warn( 'warn ', msg, meta );
};

var LOG_CACHE = {};
exports.named = function( name ) {
  if ( LOG_CACHE[ name ] ) {
    return LOG_CACHE[ name ];
  }
  LOG_CACHE[ name ] = logger = new NamespacedLogger( name );
  return logger;
};