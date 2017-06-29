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

        if (res.message.room != gifChannel) {
            if(!robot.userGifUsage[res.message.user]) {
                robot.userGifUsage[res.message.user] = 0;
			}
            
            if (robot.userGifUsage[res.message.user] >= gifLimit) {
                res.reply('You\'ve reached your gif limit for the day. Try #' + gifChannel);
			}
            else {
                res.reply(robot.userGifUsage[res.message.user] + ' of ' + gifLimit + ' gifs used for the day.');
                
                if (!!respondWithGif(term)) {
                    robot.userGifUsage[res.message.user]++;
				}
			}
		}
        else {
            respondWithGif(term);
		}
	});
    
    function respondWithGif(searchTerm) {
        var baseUrl = 'https://api.giphy.com/v1/gifs/search';
        
        var data = {
            api_key: process.env.HUBOT_GIPHY_TOKEN,
            q: searchTerm,
            limit: 1,
            offset: 0,
            rating: gifRating,
            lang: 'en'
        };
		    
        var request = {
          url: baseUrl,
          qs: data
        };
      
        robot.http(request)
            .header('Accept', 'application/json')
            .path('v1/gifs/search')
            .get()(function(err, resp, body) {
                var success = false
                if (err) {
                    robot.reply('Sorry, I couldn\'t find a gif for that search term.');
				        }
                else {
                    robot.send(body.data.url);
                    success = true;
                }
				
                return success;
			});
	}
}
