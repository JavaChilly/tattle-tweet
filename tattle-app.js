
var     _ = require( 'underscore' ),
     util = require( 'util' ),
     ping = require( 'ping' ),
    async = require( 'async' ),
   config = require( './lib/config' ),
   logger = require( './lib/logger' ).named( 'tattle-tweet' ),
  Twitter = require( 'twitter' ),
  service = require( './lib/service' );

var twitterClient = null;
if ( _.has( process.env, 'TWITTER_CONSUMER_KEY' ) ) {
  // read from environment variables
  twitterClient = new Twitter({
    consumer_key       : process.env.TWITTER_CONSUMER_KEY,
    consumer_secret    : process.env.TWITTER_CONSUMER_SECRET,
    access_token_key   : process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
} else {
  // read from config file
  twitterClient = new Twitter( config.twitter );
}

var PING_HOSTS    = config.ping.hosts;
var PING_INTERVAL = config.ping.interval;
var TWEET_BODY    = config.twitter.update_body;

var lastGoodCheck = new Date();
var networkIsGood = true;
var checking = 0;
var WORK_FUNCTION = function() {
  if ( checking > 0 ) {
    // still working from previous call, don't bother until its free
    return;
  }
  checking = PING_HOSTS.length;
  var networkOK = false;
  async.reduce( PING_HOSTS, [], function( results, host, cb ) {
    ping.sys.probe( host, function( isAlive ) {
      results[ results.length ] = { 'host' : host, 'state' : isAlive };
      checking--;

      if ( isAlive ) {
        networkOK = true;
      }

      cb( null, results );
    });
  }, function( err, results ) {
    checking = 0;
    if ( err ) {
      networkIsGood = false;
      return logger.error( 'error while pinging', err );
    }

    if ( networkOK ) {
      var now = new Date();
      if (!networkIsGood) {
        var diffSeconds = ( ( now.getTime() - lastGoodCheck.getTime() ) - PING_INTERVAL ) / 1000.0;
        var status = 'network was down for at least ' + diffSeconds + ' seconds';

        logger.info( status );

        twitterClient.post( 'statuses/update', { status: util.format( TWEET_BODY, diffSeconds ) },  function( error, tweet, response ){
          logger.debug( tweet );
          if( error ) {
            return logger.error( 'error while tweeting', error );
          }
        });

      }

      networkIsGood = true;
      lastGoodCheck = new Date();
      var downHosts = [];
      for ( var i = 0; i < results.length; i++ ) {
        var r = results[ i ];
        if ( !r.state ) {
          downHosts.push( r.host );
        }
      }
      logger.debug( 'up   ' + downHosts.join( ', ' ) );
    } else {
      logger.info( 'down' );
      networkIsGood = false;
    }
  });
};

// build a worker agent service,
// that will invoke the work function passed to it repeatedly
service.workerAgent( 'tattle-tweet', { 'interval' : PING_INTERVAL }, function( err , doWork ) {
  if ( err ) return logger.named( 'tattle-tweet' ).error( 'fatal startup error' );

  // whenever its time to do work, all the worker jobs get processed
  doWork( WORK_FUNCTION );

});