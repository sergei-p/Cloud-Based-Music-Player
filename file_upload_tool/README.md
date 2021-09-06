# AWS S3 & DynamoDB CLI Tool


### Table of Contents
- [Description](#description)
- [Prerequisite Dependancies](#prerequisite-dependancies)
- [Installation](#installation)
- [How to Use](#how-to-use)

## Description
CLI based program for uploading songs (mp3 files), albums, and artists to AWS S3 and Dynamo DB.

## Prerequisite Dependancies
In order to runt this program the user must have the following dependencies installed.
- AWS CLI
- Node.js
- npm

## Installation
Navigate to project directory. Install npm modules, using the following command.

`npm install`

## How to Use
The project folder contains a coulpe of sample mp3 files, one sample album, and one sample artist.

#### Configure AWS Profile
In upload.js add profile name at this location
```
// define config profile here
var credentials = new AWS.SharedIniFileCredentials({profile: " "});
AWS.config.credentials = credentials;
var s3 = new AWS.S3(); 
```
#### Configure Bucket
In upload.js add bucket name at this location
```
// Define bucket name here
const bucketName = " ";
```


NOTE: optional fields must specified in given order
#### Upload Song
`node upload.js upload_song <file name> [album name] [artist name] [genre]`

#### Upload Album
`node upload.js upload_album <folder name> [artist name] [genre]`

#### Upload Artist
`node upload.js upload_artist <folder name> [genre]`








