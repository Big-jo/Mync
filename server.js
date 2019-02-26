
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser')
const fs = require('fs')
const shortid = require('shortid');
const path = require('path');
const config = require('./config/config');

//Use morgan in dev mode
if (process.env.NODE_ENV = 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

// Check if user_songs file exist
if(!fs.existsSync(path.join(__dirname,"user_songs"))){
    fs.mkdirSync(path.join(__dirname, "user_songs"));
}

// Keeps track of music files coming in
let fileTracker = [];

app.use(express.static('public'));
app.use(bodyParser.json({
    limit: "20mb"
}));


app.get('/', (req, res) => {
    res.send('index.html');
});


// Erase the users music-file over-time
function eraseSong() {
    fs.unlink("user_songs/" + fileTracker.shift(), (err) => {
        if (err) {
            throw err;
        }

    });
}

app.post('/send', (req, res) => {
    let songID = req.body.songID;
    fileTracker.push(songID);
    fs.writeFile("user_songs/" + songID, req.body.songData[1], "base64", (err) => {
        if (err) {
            throw err
        }
    })
    timeout();
    res.send('Done');
});

app.get('/stream/:id', (req, res) => {
    fs.readdir(path.join(__dirname, "user_songs"), (err, list) => {
        if (err) {
            console.log(err);
            throw err;
        }
        for (let id of list) {
            if (id == req.params.id) {
                console.log(2);
                let stat = fs.statSync(path.join(__dirname, "user_songs", req.params.id)); // Retrieve stats of the file
                let readStream = fs.createReadStream(path.join(__dirname, "user_songs", req.params.id)); // Creates a readStream from the song on the fileSystem
                res.type("audio/.mp3");
                res.set('Content-Length', stat.size)
                readStream.pipe(res);
            }
        }

    })

});

app.get('/generate', (req, res) => {
    let key = shortid.generate();
    res.send(key);
});


server.listen(config.app.port, () => {
    console.log('Server started on port:' + config.app.port);
});

// File deletion starts after timeout

function timeout() {
    setTimeout(() => {
        if (fileTracker.length >= 1) {
            console.log(fileTracker);
            eraseSong();
            timeout();
        } else {
            timeout();
        }
    }, config.app.timeOut)
}