(function () {
    var modalStart = '<div class="modal fade"><div class=modal-dialog><div class=modal-content><div class=modal-body><button class=close data-dismiss=modal>&times;</button><br>',
        modalEnd = '</div></div></div></div>';

    window.bootstrapAlert = function (message) {
        $('#modal-placeholder').html(modalStart +
            message + '<br><br><button class="btn btn-sm center-block" data-dismiss=modal>&nbsp; Ok &nbsp;</button>' +
            modalEnd);
        $('.modal').modal('show');
    };


    window.bootstrapConfirm = function (message, btnOne, btnTwo, callback) {
        $('#modal-placeholder').html(modalStart +
            message + '<br><br><button class="btn btn-sm btn-primary pull-right m-r-2" data-dismiss=modal>&nbsp; ' +
            btnOne +
            ' &nbsp;</button><button class="btn btn-sm btn-secondary pull-right" data-dismiss=modal>&nbsp; ' +
            btnTwo +
            ' &nbsp;</button>' +
            modalEnd);

        var modal = $('.modal');
        modal.modal('show');
        modal.find('.btn-primary').on('click', function () {
            callback(1);
        });
        modal.find('.btn-secondary').on('click', function () {
            callback(2);
        });
    };
})();
