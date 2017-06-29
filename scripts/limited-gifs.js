module.exports = function(robot) {

    robot.userGifUsage = {};
    var gifChannel = 'jiffs'
    var gifLimit = 10
    var gifRating = 'PG-13'
    
    robot.respond(/gif (.*)/i, function(res) {
        var term = res.match[1];
        
        if (term.length === 0) {
            res.reply('You have to enter a search term if you want to see a gif.');
    		}

        if(!robot.userGifUsage[res.message.user]) {
          robot.userGifUsage[res.message.user] = 0;
			  }
      
        if (res.message.room != gifChannel) {
            if (robot.userGifUsage[res.message.user] >= gifLimit) {
                res.reply('You\'ve reached your gif limit for the day. Try #' + gifChannel);
			      }
            else {
                res.reply(robot.userGifUsage[res.message.user] + ' of ' + gifLimit + ' gifs used for the day.');               
                respondWithGif(term, res, true);
            }
			  }
        else {
          respondWithGif(term, res, false);
        }
	  });
    
    function respondWithGif(searchTerm, msg, increment) {
        var baseUrl = 'https://api.giphy.com/v1/gifs/search';
        
        var data = {
            api_key: process.env.HUBOT_GIPHY_TOKEN,
            q: searchTerm,
            limit: 1,
            offset: 0,
            rating: gifRating,
            lang: 'en'
        };
		    
        var requestUrl = baseUrl;
        var firstTime = true;
        for (var item in data) {
          if (!!firstTime) {
            requestUrl += '?';
            firstTime = false;
          }
          else {
            requestUrl += '&';
          }

          requestUrl += item + '=' + data[item];
        }
        
        robot.logger.debug('sending request:' + requestUrl);
        robot.http(requestUrl)
            .header('Accept', 'application/json')
            .get()(function(err, resp, body) {
                if (err) {
                    robot.reply('Sorry, I couldn\'t find a gif for that search term.');
				        }
                else {
                    robot.logger.debug('response: ' + resp);
                    robot.logger.debug('body: ' + body);
                    var data = JSON.parse(body);

                    msg.send(data.data[0].bitly_gif_url);
                    if (!!increment) {
                      robot.userGifUsage[msg.message.user]++;
                    }
                }
			      });
	  }
}
