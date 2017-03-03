/**
 * Created by lijiahao on 17/3/2.
 */
;(function () {
    var main = {
        init: function () {
            toastr.success('Have fun storming the castle!', 'Miracle Max Says');
            this.timepicker();
        },
        addEvent: function () {

        },
        timepicker: function () {
            $('#timepicker').daterangepicker({
                startDate: moment().subtract(29, 'days'),
                endDate: moment()
            }, function(start, end, label) {
                console.log(start.format('YYYY-MM-DD'));
                console.log(end.format('YYYY-MM-DD'));
            });
        }
    };
    // run
    $(function () {
        main.init();
    })
})();