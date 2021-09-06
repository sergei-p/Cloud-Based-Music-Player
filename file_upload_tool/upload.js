var path = require('path');
var async = require('async');
var fs = require('fs');
var AWS = require('aws-sdk'); 
const { v4: uuidv4 } = require('uuid');

// NOTE: you must have your AWS 'config' and 'credentials' files configured locally in order to use this application
// NOTE: in command line run 'export AWS_SDK_LOAD_CONFIG=1'

var credentials = new AWS.SharedIniFileCredentials({profile:"default"});
AWS.config.credentials = credentials;
var s3 = new AWS.S3(); 
// Define bucket name here
const bucketName = "";

var docClient = new AWS.DynamoDB.DocumentClient();

function uploadFile(absoluteFilePath, _bucketName, genreCategory) {
    const fileName = path.basename(absoluteFilePath);
    console.log("file name: " + fileName);
    const s3Path = _bucketName + "/" + fileName;
    console.log("s3 path: " + s3Path);
    
    async.retry((retryCb) => {
        fs.readFile(absoluteFilePath, (err, fileData) => {
          s3.putObject({
            Bucket: _bucketName, 
            Key: fileName, 
            Body: fileData
          }, retryCb);        
        });
      }, (err, result) => {
          if(err){
            console.log("An error occured")
            console.log(err)
          } else {
              console.log("Upload was successfull")
              addSongToDatabase(s3Path, genreCategory);

          }
      });
  }
  
function addSongToDatabase(filePath, genreType){
    var songName = path.basename(filePath);
    var artistName = filePath.split("/")[1];
    var albumName = filePath.split("/")[2];
    var songID = uuidv4();
    var s3KeyValue = filePath.substring(filePath.indexOf("/") + 1);

    var params = {
        RequestItems: {
            music: [
                {
                    PutRequest: {
                        Item: {
                            songPK: songName,
                            artistSK: artistName,
                            id: songID,
                            album: albumName,
                            genre: genreType,
                            s3_key: s3KeyValue,
                        }
                    }
                }
            ]
        }
    }

    docClient.batchWrite(params, function(err, data) {
        if(err) console.log(err);
        else console.log(data);
    });

}
  
  function handleSongUpload() {
    if(!fs.existsSync(process.argv[3])) {
        console.log("File does not exist");
        return;
    }

    var albumName = "unknownAlbum";
    var artistName = "unknownArtist";
    var genreCategory = "unknownGenre";
   
    if(process.argv[4] !== undefined){
        albumName = process.argv[4];
    }   
    if(process.argv[5] !== undefined){
        artistName = process.argv[5];
    }
    if(process.argv[6] !== undefined){
        genreCategory = process.argv[6];
    }
  
      const remoteLocation = bucketName + "/" + artistName + "/" + albumName;
      uploadFile(process.argv[3], remoteLocation, genreCategory);

  }
  
  function handleAlbumUpload() {
      if(!fs.existsSync(process.argv[3])) {
          console.log("File does not exist");
          return;
      }

      var artistName = "unknownArtist";
      var genreCategory = "unknownGenre";
      
      if(process.argv[4] !== undefined){
          artistName = process.argv[4];
      }
      if(process.argv[5] !== undefined){
          genreCategory = process.argv[5];
      }



      fs.readdir(process.argv[3], (err, files) => {
          if(!files || files.length === 0){
              console.log(`Album '${process.argv[3]}' is empty.`)
              console.log("No files were uploaded");
              return;
          }
          
          const remoteLocation = bucketName + "/" + artistName +  "/" + process.argv[3]; 
  
          for(const fileName of files) {
              const uploadPath = process.argv[3] + "/" + fileName;
              uploadFile(uploadPath, remoteLocation, genreCategory);
              
          }
      })

  }
  
  function handleArtistUpload() {
      if(!fs.existsSync(process.argv[3])) {
          console.log("File does not exist");
          return;
      }
      
      var genreCategory = "uknownGenre";

      if(process.argv[4] !== undefined) {
          genreCategory = process.argv[4];
      }


      fs.readdir(process.argv[3], (err, folders) => {
          if(!folders || folders.length === 0){
              console.log(`Artist '${process.argv[3]}' has no albums.`)
              console.log("No files were uploaded");
              return;
          }
          
          for(const folder of folders){
  
          fs.readdir(process.argv[3] + "/" + folder, (err, files) => {
              const remoteLocation = bucketName + "/" + process.argv[3] + "/" + folder; 
              for(const file of files) {
                  const uploadPath = process.argv[3] + "/" + folder + "/" + file;
                  console.log("upload path: " + uploadPath);
                  uploadFile(uploadPath, remoteLocation, genreCategory);
              }
              
          })
          }
  
      })

    }
  
  
  if(process.argv[2] === undefined) {
  
      console.log("No actions have beend specified");
  
  } else if(process.argv[2] === "upload_song"){
  
      handleSongUpload();
  
  } else if(process.argv[2] === "upload_album") {
  
      handleAlbumUpload();
  
  } else if(process.argv[2] === "upload_artist") {
  
      handleArtistUpload();
  
  } else {
      console.log("Action does not exist")
  }
