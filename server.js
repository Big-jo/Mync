// path.join(__dirname) = process.cwd();
process.env.NODE_ENV = "production";
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const fs = require("fs");
const shortid = require("shortid");
const path = require("path");
const config = require("./config/config");
const multipart = require("connect-multiparty");
const resumable = require("./resumable-node")(path.join(__dirname,"temp"));
const crypto = require("crypto");

//	Use morgan in dev mode

if ((process.env.NODE_ENV = "development")) {
  const morgan = require("morgan");
  //   app.use(morgan("dev"));
}

// Check if user_songs file exist
if (!fs.existsSync(path.join(path.join(__dirname, "user_songs")))) {
  fs.mkdirSync(path.join(path.join(__dirname, "user_songs")));
}
if (!fs.existsSync(path.join(path.join(__dirname, "temp")))) {
  fs.mkdirSync(path.join(path.join(__dirname, "temp")));
}

//	 Keeps track of music files coming in
let fileTracker = [];
let identiferTracker = [];

app.use(express.static("public"));
app.use(
  bodyParser.json({
    limit: "30mb"
  })
);
app.use(multipart());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index", "index.html"));
});

// 	Erase the users music-file over-time
function eraseSong() {
  fs.unlink("user_songs/" + fileTracker.shift(), err => {
    if (err) {
      throw err;
    }
  });
  resumable.clean(identiferTracker.shift());
}

app.get("/fileid", function(req, res) {
  if (!req.query.filename) {
    return res.status(500).end("query parameter missing");
  }
});

app.post("/send", (req, res) => {
  // store key in fileTracker
  if (!fileTracker.includes(req.query.key)) {
    fileTracker.push(req.query.key);
  }
  resumable.post(req, (status, filename, origin_filename, identifier) => {
    if (!identiferTracker.includes(identifier))
      identiferTracker.push(identifier);
    // console.log("POST", status, identifier);

    //	 createWriteStream to "done" otherwise "partly_done"
    if (status === "done") {
      //	when all chunks are uploaded,create
      //    WriteStream to /uploads folder with filname
      let stream = fs.createWriteStream(
        path.join(path.join(__dirname, "user_songs", req.query.key))
      );

      // 	stitch the file chuncks back
      resumable.write(identifier, stream);
      stream.on("data", data => {});
      stream.on("end", () => {});
      console.log('DONE WRIITING');
    }

    res.send(status);
  });
});

// Handle status checks on chunks through Resumable.js
app.get("/send", function(req, res) {
  resumable.get(req, function(status, filename, original_filename, identifier) {
    // console.log("GET", status);
    res.send(status == "found" ? 200 : 404, status);
  });
});

/**
 * @param IDs- contains a list of all the files gotten from the directory
 */
app.get("/stream/:id", (req, res) => {
  fs.readdir(path.join(path.join(__dirname, "user_songs")), (err, IDs) => {
    if (err) {
      console.log(err);
      throw err;
    }
    if (!fs.existsSync( path.join(path.join(__dirname, "user_songs"), req.params.id))) {
      
      res.send("Oops Sorry,Your Song Is'nt Ready Yet");
    } else {
      for (let ID of IDs) {
        if (ID == req.params.id) {
          const _path = path.join(path.join(__dirname, "user_songs"), ID);
          const fileSize = fs.statSync(_path).size;
          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = fs.createReadStream(_path, { start, end });
            const head = {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize,
              "Content-Type": "audio/mp4"
            };
            res.writeHead(206, head);
            file.pipe(res);
          } else {
            const head = {
              "Content-Length": fileSize,
              "Content-Type": "audio/mp3"
            };
            res.writeHead(200, head);
            fs.createReadStream(_path).pipe(res);
          }
        }
      }
    }
  });
});

app.get("/generate", (req, res) => {
  res.send(shortid.generate());
});

// server.listen(config.app.port, () => {
//   console.log("Server started on port:" + config.app.port);
// });
server.listen(config.app.port, "0.0.0.0");

// File deletion starts after timeout
function timeout() {
  setTimeout(() => {
    if (fileTracker.length >= 1) {
      eraseSong();
      timeout();
    } else {
      timeout();
    }
  }, config.app.timeOut);
}

/**
 * TODO: rewwire UI to work with new file uploader and backend solution-
 *
 * Make UI start upload on button press - on button press add generated key to query param
 * find a way to for temp folder to be cleaned up reagularly
 */

// app.get("/stream/:id", (req, res) => {
//   console.log(req.params);
//   fs.readdir(path.join(path.join(__dirname), "user_songs"), (err, list) => {
//     if (err) {
//       console.log(err);
//       throw err;
//     }
//     for (let id of list) {
//       console.log(id);
//       if (id == req.params.id) {
//         let stat = fs.statSync(
//           path.join(path.join(__dirname), "user_songs", req.params.id)
//         ); // Retrieve stats of the file
//         let readStream = fs.createReadStream(
//           path.join(path.join(__dirname), "user_songs", req.params.id)
//         ); // Creates a readStream from the song on the fileSystem
//         res.type("audio/.mp3");
//         res.set("Content-Length", stat.size);
//         readStream.pipe(res);
//       }
//     }
//   });
// });

// let songID = req.body.songID;
// fileTracker.push(songID);
// fs.writeFile("user_songs/" + songID, req.body.songData[0], "base64", (err) => {
//     if (err) {
//         throw err
//     }
// })
// timeout();
// res.send('Done');
