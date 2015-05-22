
# Tattle-Tweet

A simple node.js app that monitors basic connectivity via ping and reports the duration of the outage via twitter. You must create a twitter app profile (https://apps.twitter.com/) to generate api keys. All ping checks must fail in order for down condition to be met.

Copy config/default.js to customize. Define environment NODE_ENV={name of new config file}. (-.js)
You can Define environment variables for twitter api keys or put them in the config file.


##environment variables:
 - TWITTER_CONSUMER_KEY
 - TWITTER_CONSUMER_SECRET
 - TWITTER_ACCESS_TOKEN_KEY
 - TWITTER_ACCESS_TOKEN_SECRET


## config options

 - node.mode (development | production) - enable to see successful checks and pings that failed
 - ping.interval - milliseconds in between checks
 - ping.hosts - array of hostnames to ping
 - twitter.update_body - the tweet to send when we're able to ping again (%d will be replaced with the duration in seconds)
