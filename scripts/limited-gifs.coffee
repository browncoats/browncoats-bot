module.exports = (robot) ->

    `robot[userGifUsage] = {};`
    gifChannel = 'jiffs'
    gifLimit = 10
    gifRating = 'PG-13'
    
    robot.respond /gif (.*)/i, (res) ->
        term = match[1]
        
        if term.length == 0
            res.reply 'You have to enter a search term if you want to see a gif.'

        if res.message.room != gifChannel
            if not robot.userGifUsage[res.message.user]?
                `robot.userGifUsage[res.message.user] = 0;`
            
            if robot.userGifUsage[res.message.user] >= gifLimit
                limitReached = 'You\'ve reached your gif limit for the day. Try #' + gifChannel
                res.reply limitReached
            else
                limitMessage = robot.userGifUsage[res.message.user] + ' of ' + gifLimit + 'gifs used for the day.'
                res.reply limitMessage
                
                if respondWithGif term
                    robot.userGifUsage[res.message.user]++
        else
            respondWithGif term
    
    respondWithGif = (searchTerm) ->
        baseUrl = 'https://api.giphy.com/v1/gifs/search'
        
        data = {
            api_key: process.env.HUBOT_GIPHY_TOKEN
            q: searchTerm
            limit: 1
            offset: 0
            rating: gifRating
            lang: en
        }
        
        robot.http(baseUrl)
            .header('Accept', 'application/json')
            .path('v1/gifs/search')
            .get(data) (err, resp, body) ->
                success = false
                if err?
                    robot.reply 'Sorry, I couldn\'t find a gif for that search term.'
                else
                    robot.send body.data.url
                    success = true
                    
                return success