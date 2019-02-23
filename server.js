const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser')
const fs = require('fs')
const shortid = require('shortid');
const path = require('path')


// Keeps track of music files coming in
let fileTracker = [];


app.use(express.static('public'));
app.use(bodyParser.json({
    limit: "20mb"
}));


app.get('/', (req, res) => {
    res.send('index.html');
});


// Erase the users music-file 
 
function eraseSong(){
    fs.unlink("user_songs/" + fileTracker.shift(),(err)=>{
        if (err) {
            console.log('unlink error',err);
            throw err;
        }

    });
}

app.post('/send', (req, res) => {
    let songID = req.body.songID;
    fileTracker.push(songID);
    fs.writeFile("user_songs/" + songID, req.body.songData[1], "base64", (err) => {
        if (err) {
            console.log(err);
        } 
    })
    timeout();
    res.send('Done');
});

//  TODO: Modularize the file list function

app.get('/stream/:id', (req, res) => {
    fs.readdir(__dirname + '\\user_songs', (err, list) => {
        if (err) {
            console.log(err);
            throw err;
        }
        list.forEach(id => {
            if (id == req.params.id) {
                let stat = fs.statSync('user_songs/' + req.params.id ); // Retrieve stats of the file
                let readStream = fs.createReadStream('user_songs/' + req.params.id); // Creates a readStream from the song on the fileSystem
                res.type("audio/.mp3");
                res.set('Content-Length', stat.size)
                readStream.pipe(res);
            }
        });

    });
 
     

});

app.get('/generate', (req, res) => {
    let key = shortid.generate();
    res.send(key);
});


app.listen(port, () => {
    console.log('Server started on port:' + port);
});

// File deletion starts after timeout
function timeout(){
    setTimeout(() => {
        if (fileTracker.length >= 1) {
            eraseSong();
        }
        else{
            timeout();
        }
    }, 1800000)
}