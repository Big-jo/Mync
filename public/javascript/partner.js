/**
 *  key - request parameter to search for file on backend
 */
function listen() {
    let audioTag = document.getElementById('audioTag')
    let sourceTag = document.getElementById('sourceTag');
    key = document.getElementById('key').value;
    sourceTag.src = "/stream/" + key;

    audioTag.load();
}

/** 
 * Handle tooltip display
*/
$('document').ready(() => {
   $('#listen').tooltip('show');
})