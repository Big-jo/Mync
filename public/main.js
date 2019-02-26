
/**
 * REMEMBER:
 *  STEPS
 *         -Generate Key
 *          -choose file
 *            -start
 */


// TODO: Clean up by moving functions and stuff to different

var key;

//  Websocket stuff //#endregion

// var socket = io('http://localhost:3000');

// TODO: Clean Up Comments, choose uniform style //#endregion

/**
 * Set audio src when button is clicked
 */
function listen(){
    let audioTag = document.getElementById('audioTag')
    let sourceTag = document.getElementById('sourceTag');
    let key = document.getElementById('key').value;
    sourceTag.src = "stream/" + key;

    audioTag.load();
}

//For listening on the sending end
function M_listen(){
    let audioTag = document.getElementById('M_audioTag')
    let sourceTag = document.getElementById('M_sourceTag');
    let key = document.getElementById('key').innerHTML;
    sourceTag.src = "stream/"+ key;

    audioTag.load();
}

/**
 * Get an Id Generated on the server
 */
function generateKey(){
    let keyElement = document.getElementById("key");
    $.ajax({
        method: "GET",
        url: "/generate",
        success : function(Key){
           key = Key;
           keyElement.innerHTML = key;
        }
    })
}

/**
 *  funnction to start Mync.
 */
function send() {
    const songFile = document.getElementById("song_input");
    const songNameElement = document.getElementById('file-n');
    var song_to_upload = songFile.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
       /**
        * @param songData - Holds primary data about song to be uploaded
        */
       var songData = {
           "songID": key,
            "songData": reader.result.split(","),
            "songType": song_to_upload.type.split("/")[1]
        };

        songNameElement.innerHTML = song_to_upload.name;

        $.ajax({
            method: "POST",
            url: "/send",
            data: JSON.stringify(songData),
            contentType: "application/json",
            success: function () {
                M_listen();
            }
        })
    }
     reader.readAsDataURL(song_to_upload)
}

