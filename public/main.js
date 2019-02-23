/**
 * REMEMBER:
 *  STEPS
 *         -Generate Key
 *          -choose file
 *            -start
 */


// TODO: Clean up by moving functions and stuff to different <i class="fa fa-files-o" aria-hidden="true"></i>

var key;
/**
 * Set audio src when button is clicked
 */


// TODO: Clean Up Comments, choose uniform style //#endregion
function listen(){
    let audioTag = document.getElementById('audioTag')
    let sourceTag = document.getElementById('sourceTag');
    let key = document.getElementById('key').value;
    sourceTag.src = "stream/" + key;

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
        console.log(song_to_upload.name);

        $.ajax({
            method: "POST",
            url: "/send",
            data: JSON.stringify(songData),
            contentType: "application/json",
            success: function () {
                console.log("Success");
            }
        })
    }
     reader.readAsDataURL(song_to_upload)
}

