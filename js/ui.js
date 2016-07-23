(function () {
    var modalStart = '<div class="modal fade"><div class=modal-dialog><div class=modal-content><div class=modal-body><button class=close data-dismiss=modal>&times;</button><br>',
        modalEnd = '</div></div></div></div>';

    window.bootstrapAlert = function (message) {
        $('#modal-placeholder').append(modalStart +
            message + '<br><button class="btn btn-sm btn-primary center-block m-t-1 p-x-3" data-dismiss=modal>Ok</button>' +
            modalEnd);
        var modal = $('.modal');
        modal.modal('show').find('.btn-primary').focus().click(function () {
            setTimeout(function () {
                modal.remove();
            }, 300);
        });
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
        modal.modal('show');
        modal.find('.btn-primary').on('click', function () {
            callback(1);
            setTimeout(function () {
                modal.remove();
            }, 300);
        }).focus();
        modal.find('.btn-secondary').on('click', function () {
            callback(2);
            setTimeout(function () {
                modal.remove();
            }, 300);
        });
    };
})();


function logOut () {
    gapi.auth2.getAuthInstance().signOut().then(function () {
        var form = $('<form action=/ method=post><input type=hidden name=logout value=' + xsrfToken + '></form>');
        $(document.body).append(form);
        form.submit();
    })
}