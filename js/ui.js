(function () {
    var modalStart = '<div class="modal fade"><div class=modal-dialog><div class=modal-content><div class=modal-body><button class=close data-dismiss=modal>&times;</button><br>',
        modalEnd = '</div></div></div></div>';


    function open (modal) {
        modal.addClass('in');
        //todo 13 27
        modal.find('button').on('click', function () {
            modal.removeClass('in');
            setTimeout(function () {
                modal.remove();
            }, 300);
        });
    }


    window.bootstrapAlert = function (message) {
        $('#modal-placeholder').append(modalStart +
            message + '<br><button class="btn btn-sm btn-primary center-block m-t-1 p-x-3" data-dismiss=modal>Ok</button>' +
            modalEnd);
        var modal = $('.modal');
        open(modal);
        modal.find('.btn-primary').focus();
    };


    window.bootstrapConfirm = function (message, btnOne, btnTwo, callback) {
        $('#modal-placeholder').append(modalStart +
            message + '<br><button class="btn btn-sm btn-primary pull-xs-right m-l-2 m-y-1" data-dismiss=modal>&nbsp; ' +
            btnOne +
            ' &nbsp;</button><button class="btn btn-sm btn-secondary pull-xs-right m-y-1" data-dismiss=modal>&nbsp; ' +
            btnTwo +
            ' &nbsp;</button><br class="clearfix"><br><br>' +
            modalEnd);

        var modal = $('.modal');
        open(modal);
        modal.find('.btn-primary').on('click', function () {
            callback(1);
        }).focus();
        modal.find('.btn-secondary').on('click', function () {
            callback(2);
        });
    };
})();




function alreadyLoggedIn () {
    $('#logged-out').hide();
    var root = $('#logged-in').show();
    angular.bootstrap(root[0], ['app']);
}


$('#loading').remove();
if (window.googleUser) {
    logIn(googleUser);
}
if (window.xsrfToken) {
    alreadyLoggedIn();
}
