
//index page tooltip  
$(document).ready(() => {
    $('#mync_s').tooltip('show');
    $('#mync_l').tooltip('show');

    setTimeout(() => {
        $('#mync_s').tooltip('hide');
    }, 3500)
    setTimeout(() => {
        $('#mync_l').tooltip('hide');
    }, 6500)

});
