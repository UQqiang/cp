/**
 * Created by lijiahao on 17/1/9.
 */
;(function ($) {
    var common = {
        init: function () {

            document.title = '管控平台';

            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;

            this.addEvent();
            this.setContentHeight();
            this.nprogress();
            this.iCheck();
            this.dateTimerPick();
            this.pagination(20);
        },
        addEvent: function () {
            var current_url = window.location.href.split('#')[0].split('?')[0],
                $body = $('body'),
                $menu_toggle = $('#menu_toggle'),
                $sidebar_menu = $('#sidebar-menu'),
                that = this;

            // 侧边栏
            $sidebar_menu.find('a').on('click', function () {
                var $li = $(this).parent();

                if ($li.is('.active')) {
                    $li.removeClass('active active-sm');
                    $('ul:first', $li).slideUp(function () {
                        that.setContentHeight();
                    });
                } else {
                    // prevent closing menu if we are on child menu
                    if (!$li.parent().is('.child_menu')) {
                        $sidebar_menu.find('li').removeClass('active active-sm');
                        $sidebar_menu.find('li ul').slideUp();
                    }
                    $li.addClass('active');

                    $('ul:first', $li).slideDown(function () {
                        that.setContentHeight();
                    });
                }
            });

            // 显示或者隐藏侧边栏
            $menu_toggle.on('click', function () {
                if ($body.hasClass('nav-md')) {
                    $sidebar_menu.find('li.active ul').hide();
                    $sidebar_menu.find('li.active').addClass('active-sm').removeClass('active');
                } else {
                    $sidebar_menu.find('li.active-sm ul').show();
                    $sidebar_menu.find('li.active-sm').addClass('active').removeClass('active-sm');
                }

                $body.toggleClass('nav-md nav-sm');

                that.setContentHeight();
            });

            // check active menu
            $sidebar_menu.find('a[href="' + current_url + '"]').parent('li').addClass('current-page');

            $sidebar_menu.find('a').filter(function () {
                return this.href == current_url;
            }).parent('li').addClass('current-page').parents('ul').slideDown(function () {
                that.setContentHeight();
            }).parent().addClass('active');

            // recompute content when resizing
            $(window).smartresize(function () {
                that.setContentHeight();
            });

            that.setContentHeight();

            // fixed sidebar
            if ($.fn.mCustomScrollbar) {
                $('.menu_fixed').mCustomScrollbar({
                    autoHideScrollbar: true,
                    theme: 'minimal',
                    mouseWheel: {preventDefault: true}
                });
            }

            // box_panel collapse
            $('.collapse-link').on('click', function () {
                var $box_panel = $(this).closest('.x_panel'),
                    $icon = $(this).find('i'),
                    $box_content = $box_panel.find('.x_content');

                // fix for some div with hardcoded fix class
                if ($box_panel.attr('style')) {
                    $box_content.slideToggle(200, function () {
                        $box_panel.removeAttr('style');
                    });
                } else {
                    $box_content.slideToggle(200);
                    $box_panel.css('height', 'auto');
                }

                $icon.toggleClass('fa-chevron-up fa-chevron-down');
            });

            // box_panel close
            $('.close-link').click(function () {
                var $box_panel = $(this).closest('.x_panel');

                $box_panel.remove();
            });

            // tooltip
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip({
                    container: 'body'
                });
            });

        },
        // 设置高度
        setContentHeight: function () {
            var $body = $('body'),
                $sidebar_footer = $('.sidebar-footer'),
                $left_col = $('.left_col'),
                $right_col = $('.right_col'),
                $nav_menu = $('.nav_menu'),
                $footer = $('footer'),
                bodyHeight = $body.outerHeight(),
                footerHeight = $body.hasClass('footer_fixed') ? -10 : $footer.height(),
                leftColHeight = $left_col.eq(1).height() + $sidebar_footer.height(),
                contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

            // 内容部分 right_col
            $right_col.css('min-height', $(window).height());
            contentHeight -= $nav_menu.height() + footerHeight;
            $right_col.css('min-height', contentHeight);
        },
        // 页面进度条
        nprogress: function () {
            if (typeof NProgress != 'undefined') {
                $(document).ready(function () {
                    NProgress.start();
                });

                $(window).load(function () {
                    NProgress.done();
                });
            }
        },
        iCheck: function () {
            if ($("input.flat")[0]) {
                $(document).ready(function () {
                    $('input.flat').iCheck({
                        checkboxClass: 'icheckbox_flat-green',
                        radioClass: 'iradio_flat-green'
                    });
                });
            }
        },
        dataTable: function () {

            TableManageButtons = function () {
                "use strict";
                return {
                    init: function () {
                        handleDataTableButtons();
                    }
                };
            }();

            $('#datatable').dataTable();

            $('#datatable-keytable').DataTable({
                keys: true
            });

            $('#datatable-responsive').DataTable();

            $('#datatable-scroller').DataTable({
                ajax: "js/datatables/json/scroller-demo.json",
                deferRender: true,
                scrollY: 380,
                scrollCollapse: true,
                scroller: true
            });

            $('#datatable-fixed-header').DataTable({
                fixedHeader: true
            });

            var $datatable = $('#datatable-checkbox');

            $datatable.dataTable({
                'order': [[1, 'asc']],
                'columnDefs': [
                    {orderable: false, targets: [0]}
                ]
            });
            $datatable.on('draw.dt', function () {
                $('input').iCheck({
                    checkboxClass: 'icheckbox_flat-green'
                });
            });

            TableManageButtons.init();

        },
        pagination: function (total) {
            var that = this;
            $('.ui-pagination').jqPaginator({
                totalCounts: total == 0 ? 10 : total,                            // 设置分页的总条目数
                pageSize: that.page.pageSize,                          // 设置每一页的条目数
                visiblePages: that.page.visiblePages,                  // 设置最多显示的页码数
                currentPage: that.pageId,                                       // 设置当前的页码
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    that.pageId = num;
                    if (type == 'change') {
                        that.getData()
                    }
                }
            });
        },
        dateTimerPick: function () {

            var cb = function (start, end, label) {
                console.log(start.toISOString(), end.toISOString(), label);
                $('#reportrange span').html(start.format('YYYY-MM-DD') + '~' + end.format('YYYY-MM-DD'));
            };

            var optionSet1 = {
                startDate: moment().subtract(29, 'days'),
                endDate: moment(),
                minDate: '01/01/2012',
                maxDate: '12/31/2099',
                dateLimit: {
                    days: 365
                },
                "singleDatePicker": true,
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
                buttonClasses: ['btn btn-default'],
                applyClass: 'btn-small btn-success',
                cancelClass: 'btn-small',
                format: 'YYYY-MM-DD',
                separator: ' to ',
                locale: {
                    applyLabel: '确定',
                    cancelLabel: '取消',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: '手动选择',
                    daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    firstDay: 1
                }
            };
            $('#reportrange span').html(moment().subtract(29, 'days').format('YYYY-MM-DD') + '~' + moment().format('YYYY-MM-DD'));
            $('#reportrange').daterangepicker(optionSet1, cb);

            $('#reportrange').on('show.daterangepicker', function () {
                console.log("show event fired");
            });
            $('#reportrange').on('hide.daterangepicker', function () {
                console.log("hide event fired");
            });
            $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
                console.log("apply event fired, start/end dates are " + picker.startDate.format('YYYY-MM-DD') + " to " + picker.endDate.format('YYYY-MM-DD'));
            });
            $('#reportrange').on('cancel.daterangepicker', function (ev, picker) {
                console.log("cancel event fired");
            });
            $('#options1').click(function () {
                $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
            });
            $('#options2').click(function () {
                $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
            });
            $('#destroy').click(function () {
                $('#reportrange').data('daterangepicker').remove();
            });
        }
    };
    // run
    $(function () {
        common.init();
    })

})(jQuery);