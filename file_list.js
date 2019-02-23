const fs = require('fs');
const path = require('path');
let files = []

function fileList() {
     fs.readdir(__dirname + '\\user_songs', (err, list) => {
            if (err) {
                console.log(err);
                throw err;
            }
             files = list;
            return 2;
        }); 
        return 2
}

module.exports = fileList();