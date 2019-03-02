// import { log } from "util";

/**
 *  key gotten from backend for global use
 */
var key;

/**
 * mync sync tooltip page
 */
$(document).ready(() => {
  $("#step1").tooltip("show");
});

/**
 * Get an Id Generated on the server
 */
function generateKey() {
  let keyElement = document.getElementById("key");
  $.ajax({
    method: "GET",
    url: "/generate",
    success: function(Key) {
      key = Key;
      keyElement.innerHTML = key;
      $("#step1").tooltip("hide");
      $("#step2").tooltip("show");
      setTimeout(() => {
        $("#step2").tooltip("hide");
        $("#song_input").tooltip("show");
        setTimeout(() => {
          $("#song_input").tooltip("hide");
          $("#start-upload-btn").tooltip("show");
        }, 5000);
      }, 3000);
      start(key)
    }
  });
}

/**
 *Start streaming back to client
 */
function M_listen() {
  let audioTag = document.getElementById("M_audioTag");
  let sourceTag = document.getElementById("M_sourceTag");
  let key = document.getElementById("key").innerHTML;
  sourceTag.src = "/stream/" + key;

  audioTag.load();
}

/**
 *  Start sync
 */
// function send() {
//     const songFile = document.getElementById("song_input");
//     const songNameElement = document.getElementById('file-n');
//     var song_to_upload = songFile.files[0];
//     const reader = new FileReader();
//     const sliceSize = 1000 * 1024
//     uploadFile(0);

//     // start upload
//     function uploadFile(start) {
//         let nextSlice = start + sliceSize + 1;
//         let blob = song_to_upload.slice(start, nextSlice);
//         reader.onloadend = function (event) {
//             if (event.target.readyState != FileReader.DONE) {
//                 return;
//             }
//             // console.log(event.target.result);
//             $.ajax({
//                 url: "/send",
//                 type: "POST",
//                 cache: "false",
//                 process: "false",
//                 data: JSON.stringify({
//                     file_data: event.target.result,
//                     file: song_to_upload.name,
//                     file_type: song_to_upload.type,
//                     songID: key
//                 }),
//                 contentType: "application/json",
//                 error: function (jqHXR, textStatus, errorThrown) {
//                     console.log(jqHXR, textStatus, errorThrown);
//                 },
//                 success: function (data) {
//                     let sizeDone = start + sliceSize;
//                     let percentDone = Math.floor((sizeDone / song_to_upload.size) * 100)
//                     console.log(percentDone);

//                     if (nextSlice < song_to_upload.size) {
//                         // update upload progress

//                         // more to upload,call function recursively
//                         uploadFile(nextSlice);
//                     } else {
//                         // update upload progress
//                         console.log(percentDone);
//                     }
//                 }
//             })
//         }

//         reader.readAsDataURL(blob)
//     }

// }

/**
 * Going to experiment with resumable.js
 */

function start(key) {
  var r = new Resumable({
    target: "/send",
    query: { key: key }
  });

  r.assignBrowse(document.getElementById("add-file-btn"));
  $("#start-upload-btn").click(function() {
    r.upload();
  });
  var progressBar = new ProgressBar($("#upload-progress"));
  r.on("fileAdded", function(file, event) {
    progressBar.fileAdded();
  });

  r.on("fileAdded", function(file, event) {
    progressBar.fileAdded();
  });

  r.on("fileSuccess", function(file, message) {
    progressBar.finish();
    $('#btn-listen').removeClass('disabled')
  });

  r.on("progress", function() {
    progressBar.uploading(r.progress() * 100);
    $("#pause-upload-btn")
      .find(".glyphicon")
      .removeClass("glyphicon-play")
      .addClass("glyphicon-pause");
  });

  r.on("pause", function() {
    $("#pause-upload-btn")
      .find(".glyphicon")
      .removeClass("glyphicon-pause")
      .addClass("glyphicon-play");
  });

  function ProgressBar(ele) {
    this.thisEle = $(ele);

    (this.fileAdded = function() {
      this.thisEle
        .removeClass("hide")
        .find(".progress-bar")
        .css("width", "0%");
    }),
      (this.uploading = function(progress) {
        this.thisEle
          .find(".progress-bar")
          .attr("style", "width:" + progress + "%");
      }),
      (this.finish = function() {
        this.thisEle.find(".progress-bar").css("width", "100%");
      });
  }
}
