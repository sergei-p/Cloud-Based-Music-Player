'use strict';
const AWS = require('aws-sdk');
const express = require('serverless-express/express');
const handler = require('serverless-express/handler');
const bodyParser = require('body-parser');


const bucketName = ''; // add bucket name here
const QUEUE_URL = ''; // add SQS queue URL here

const docClient  = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const sqs = new AWS.SQS();
const app = express();

const jsonParser = bodyParser.json();


function parseGenres(data){
  var parsedGenreData = [];
  for(const item of data.Items){
    if(!parsedGenreData.includes(item.genre)){
      parsedGenreData.push(item.genre);
    }
  }
  return parsedGenreData;
}

function parseArtists(data){
  var parsedArtistData = [];
  for(const item of data.Items){
    if(!parsedArtistData.includes(item.artistSK)){
      parsedArtistData.push(item.artistSK);
    }
  }
  return parsedArtistData;  
}

function parseAlbums(data){
  var parsedAlbumData = [];
  for(const item of data.Items){
    if(!parsedAlbumData.includes(item.album)){
      parsedAlbumData.push(item.album);
    }
  }
  return parsedAlbumData;  
}

function parseSongs(data){
  var parsedSongData = [];
  for(const item of data.Items){
    if(!parsedSongData.includes(item.songPK)){
      parsedSongData.push(item.songPK);
    }
  }
  return parsedSongData;  
}

function parseSongsArtists(data) {
  var parsedSongArtist = [];
  for(const item of data.Items){
    parsedSongArtist.push(item);
  }
  return parsedSongArtist;
}

function parseSongObject(data){
  const signedURlExpiration = 60 * 10; // 10 minutes 
  var signedURL = s3.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: data.Responses.music[0].s3_key,
    Expires: signedURlExpiration
  })
  return signedURL;
}

app.get('/genres', function(req, res) {
  // get all genres
  var params = {
    ExpressionAttributeNames: { "#genre": "genre" }, 
    ProjectionExpression: "#genre",
    TableName: "music"
  };

  docClient.scan(params, function(err, data) {
    if(err) {
      console.log("Error occured while retrieving genres");
      console.log(err);
      req.status(err.statusCode).send({"errorMessage": err.message});
    } else {
      res.send(parseGenres(data));
    }
  })

})

app.get('/artists', function(req, res) {
  // get all genres
  var params = {
    ExpressionAttributeNames: { "#artistSK": "artistSK" }, 
    ProjectionExpression: "#artistSK",
    TableName: "music"
  };

  docClient.scan(params, function(err, data) {
    if(err) {
      console.log("Error occured while retrieving artists");
      console.log(err);
      req.status(err.statusCode).send({"errorMessage": err.message});
    } else {
      res.send(parseArtists(data));
    }
  })

})



app.get('/artists/for/genre', function(req, res){
  if(req.query.genre !== undefined){
    // genre gives us artists
    var params = {
    ExpressionAttributeNames: { "#artistSK": "artistSK" }, 
    ExpressionAttributeValues: { ":genre": req.query.genre }, 
    FilterExpression: "genre = :genre", 
    ProjectionExpression: "#artistSK",
    TableName: "music"
    };

    docClient.scan(params, function(err, data) {
      if(err) {
        console.log("Error occured while retrieving artists by genre");
        console.log(err);
        res.status(err.statusCode).send({"errorMessage": err.message});
      } else {
        res.send(parseArtists(data));
      }
    })

  } else {
      res.send({"errorMessage": "query parameter not specified, endpoint requires query parameter"});
  }

})

app.get('/songs/for/genre', function(req, res){
  if(req.query.genre !== undefined){
    // genre gives us artists
    var params = {
    ExpressionAttributeNames: { "#songPK": "songPK", "#artistSK": "artistSK" }, 
    ExpressionAttributeValues: { ":genre": req.query.genre }, 
    FilterExpression: "genre = :genre", 
    ProjectionExpression: "#songPK, #artistSK",
    TableName: "music"
    };

    docClient.scan(params, function(err, data) {
      if(err) {
        console.log("Error occured while retrieving artists by genre");
        console.log(err);
        res.status(err.statusCode).send({"errorMessage": err.message});
      } else {
        res.send(parseSongsArtists(data));
      }
    })

  } else {
      res.send({"errorMessage": "query parameter not specified, endpoint requires query parameter"});
  }

})


app.get('/albums/for/artist', function(req, res){
  if(req.query.artist !== undefined){
    // artist gives us albums
    var params = {
      ExpressionAttributeNames: { "#album": "album" }, 
      ExpressionAttributeValues: { ":artistSK": req.query.artist }, 
      FilterExpression: "artistSK = :artistSK", 
      ProjectionExpression: "#album",
      TableName: "music"
  };

  docClient.scan(params, function(err, data) {
    if(err) {
      console.log("Error occured while retrieving albums by artist");
      console.log(err);
      res.status(err.statusCode).send({"errorMessage": err.message});
    } else {
      res.send(parseAlbums(data));
    }
  })

  } else {
      res.status(400).send({"errorMessage": "query parameter not specified, endpoint requires query parameter"});
  }
})

app.get('/songs/for/artist', function(req, res){
  if(req.query.artist !== undefined){
    // artist gives us albums
    var params = {
      ExpressionAttributeNames: { "#songPK": "songPK" }, 
      ExpressionAttributeValues: { ":artistSK": req.query.artist }, 
      FilterExpression: "artistSK = :artistSK", 
      ProjectionExpression: "#songPK",
      TableName: "music"
  };

  docClient.scan(params, function(err, data) {
    if(err) {
      console.log("Error occured while retrieving albums by artist");
      console.log(err);
      res.status(err.statusCode).send({"errorMessage": err.message});
    } else {
      res.send(parseSongs(data));
    }
  })

  } else {
      res.status(400).send({"errorMessage": "query parameter not specified, endpoint requires query parameter"});
  }
})


app.get('/songs/for/album', function(req, res){
  if(req.query.album !== undefined){
    // album gives us songs 
    var params = {
      ExpressionAttributeNames: { "#songPK": "songPK" }, 
      ExpressionAttributeValues: { ":album": req.query.album }, 
      FilterExpression: "album = :album", 
      ProjectionExpression: "#songPK",
      TableName: "music"
    };

    docClient.scan(params, function(err, data){
      if(err) {
        console.log("Error occured while retrieving songs by album");
        console.log(err);
        res.status(err.statusCode).send({"errorMessage": err.message});
      } else {
          res.send(parseSongs(data));
      }
    })


  } else {
      res.status(400).send({"errorMessage": "query parameter not specified, endpoint requires query parameter"});
  }
})

app.get("/song", function(req, res){
  if(req.query.artist !== undefined && req.query.song !== undefined){
    var params = {
      RequestItems: {
          music: {
              Keys: [
                  {
                      songPK: req.query.song,
                      artistSK: req.query.artist
                  }
              ]
          }
      }
   }

    docClient.batchGet(params, function(err, data){
      if(err){
        console.log("Error occured while retrieving playable song URL by artist and song");
        console.log(err);
        res.status(err.statusCode).send({"errorMessage": err.message});
      } else {
        res.send(parseSongObject(data));
        console.log(parseSongObject(data));
      }
    })
  } else {
      res.status(400).send({"errorMessage": "query parameters not specified, endpoint requires two query parameters"});
  }
})

app.post("/play", jsonParser, function(req, res) {
  if(Object.keys(req.body).length){
    if("artist" in req.body && "album" in req.body && "song" in req.body){
      
      var musicData = {
        arist: req.body.artist,
        album: req.body.album,
        song: req.body.song
      }

      var params = {
        MessageBody: JSON.stringify(musicData),
        QueueUrl: QUEUE_URL
      }

      sqs.sendMessage(params, function(err, data){
        if(err){
          console.log(err);;
          res.status(err.statusCode).send({"errorMessage": err.message});
        } else {
          console.log("data: " + data.MessageId);
          res.status(200).send({"message": "Request was successfully processed"});
        }
      })
    
    } else {
      res.status(400).send({"errorMessage":"Malformed body in request. Request body must contain JSON object with fields artist, album, and song"});
    }
  } else {
    res.status(400).send({"errorMessage": "Request body is empty. Request body must contain JSON object with fields artist, album, and song"});
  }
})

module.exports.api = handler(app);

module.exports.sqsInterface = (event, context, callback) => {
  console.log(event.Records);
}