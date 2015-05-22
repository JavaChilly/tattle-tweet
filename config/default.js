module.exports = {
  node : {
    mode : 'production'
  },

  ping : {
    interval : 60000,
    hosts : [ 'www.google.com', 'www.yahoo.com', 'www.bbc.co.uk', 'telstra.com.au' ]
  },

  twitter : {
    consumer_key        : '',
    consumer_secret     : '',
    access_token_key    : '',
    access_token_secret : '',
    update_body         : 'Back online, my connection was down for %d seconds #InternetHealthTest #TattleTweet https://github.com/JavaChilly/tattle-tweet'
  }
};