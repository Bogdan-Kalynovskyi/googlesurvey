(function () {
    var modalStart = '<div class="modal fade"><div class=modal-dialog><div class=modal-content><div class=modal-body><button class=close data-dismiss=modal>&times;</button><br>',
        modalEnd = '<br></div></div></div></div>';

    window.bootstrapAlert = function (message) {
        $('#modal-placeholder').append(modalStart +
            message + '<br><button class="btn btn-sm btn-primary center-block m-t-1" data-dismiss=modal> &nbsp; Ok &nbsp; </button>' +
            modalEnd);
        $('.modal').modal('show').find('.btn-primary').focus();
    };


    window.bootstrapConfirm = function (message, btnOne, btnTwo, callback) {
        $('#modal-placeholder').append(modalStart +
            message + '<br><button class="btn btn-sm btn-primary pull-xs-right m-l-2 m-y-1" data-dismiss=modal>&nbsp; ' +
            btnOne +
            ' &nbsp;</button><button class="btn btn-sm btn-secondary pull-xs-right m-y-1" data-dismiss=modal>&nbsp; ' +
            btnTwo +
            ' &nbsp;</button><br class="clearfix">' +
            modalEnd);

        var modal = $('.modal');
        modal.modal('show');
        modal.find('.btn-primary').on('click', function () {
            callback(1);
        }).focus();
        modal.find('.btn-secondary').on('click', function () {
            callback(2);
        });
    };
})();
