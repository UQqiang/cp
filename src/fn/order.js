/**
 * Created by lijiahao on 17/3/2.
 */
;(function () {
    var main = {
        init: function () {
            this.dateTimerPick();
        },
        addEvent: function () {

        },
        timepicker: function () {
            //$('#timepicker').daterangepicker({
            //    startDate: moment().subtract(29, 'days'),
            //    endDate: moment()
            //}, function(start, end, label) {
            //    console.log(start.format('YYYY-MM-DD'));
            //    console.log(end.format('YYYY-MM-DD'));
            //});
            //$('#timepicker').daterangepicker({
            //    singleDatePicker: true,
            //    singleClasses: "picker_1"
            //}, function(start, end, label) {
            //    console.log(start.toISOString(), end.toISOString(), label);
            //});
        },
        dateTimerPick: function () {
            var optionSet1 = {
                singleClasses: "picker_3",
                startDate: moment().subtract(1, 'days'),
                endDate: moment(),
                minDate: '2012-01-01',
                maxDate: '2099-12-31',
                dateLimit: {
                    days: 365
                },
                singleDatePicker: false,
                showDropdowns: true,
                showWeekNumbers: false,
                timePicker: false,
                timePickerIncrement: 1,
                timePicker12Hour: true,
                ranges: {
                    '今天': [moment(), moment()],
                    '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '最近七天': [moment().subtract(6, 'days'), moment()],
                    '最近三十天': [moment().subtract(29, 'days'), moment()],
                    '这个月': [moment().startOf('month'), moment().endOf('month')],
                    '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                },
                opens: 'left',
                buttonClasses: ['btn btn-sm btn-default'],
                applyClass: 'btn-sm btn-success',
                cancelClass: 'btn-sm btn-danger',
                format: 'YYYY-MM-DD',
                separator: ' to ',
                locale: {
                    applyLabel: '确定',
                    cancelLabel: '取消',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: '手动选择日期',
                    daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    firstDay: 1
                }
            };
            //$('#timepicker span').html(moment().subtract(29, 'days').format('YYYY-MM-DD') + '~' + moment().format('YYYY-MM-DD'));
            $('#timepicker').daterangepicker(optionSet1, function (start, end, label) {
                console.log(start.toISOString(), end.toISOString(), label);
                $('#timepicker span').text(start.format('YYYY-MM-DD') + ' ~ ' + end.format('YYYY-MM-DD'));
            });

            $('#timepicker').on('cancel.daterangepicker', function (ev, picker) {
                $(this).find('span').text('请选择相应的时间');
            });

            //$('#reportrange').on('show.daterangepicker', function () {
            //    console.log("show event fired");
            //});
            //$('#reportrange').on('hide.daterangepicker', function () {
            //    console.log("hide event fired");
            //});
            //$('#reportrange').on('apply.daterangepicker', function (ev, picker) {
            //    console.log("apply event fired, start/end dates are " + picker.startDate.format('YYYY-MM-DD') + " to " + picker.endDate.format('YYYY-MM-DD'));
            //});
            //$('#options1').click(function () {
            //    $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
            //});
            //$('#options2').click(function () {
            //    $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
            //});
            //$('#destroy').click(function () {
            //    $('#reportrange').data('daterangepicker').remove();
            //});
        }
    };
    // run
    $(function () {
        main.init();
    })
})();