/**
 * Created by lijiahao on 17/3/2.
 */
;(function () {
    var main = {
        init: function () {
            this.api = Api.domain();                    // 接口请求的api
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;
            this.search_key = {};
            // 初始化提示框
            toastr.options = ({
                progressBar: true,
                positionClass: "toast-top-center"
            });
            this.orderStatusData = {
                '10': '待支付',
                '20': '买家已取消',
                '21': '卖家已取消',
                '30': '已支付',
                '40': '已发货',
                '50': '已签收',
                '60': '已评价',
                '70': '退款中',
                '80': '退款完成',
                '90': '订单关闭'
            };
            this.dateTimerPick();
            this.addEvent();
            this.queryOrderList();
        },
        addEvent: function () {
            var that = this;

            // 加星
            $(document).on('click', '.j-star', function () {
                var data = {};
                data.order_id = $(this).attr('data-id');
                data.user_id = $(this).attr('data-user_id');
                data.asterisk_marks = $(this).attr('data-asterisk_mark') == 1 ? 'n' : 'y';
                that.addStar(data);
            });

            // 备注
            $(document).on('click', '.j-add-comment', function () {
                var sendData = {};
                var config = {};
                var memo = $(this).attr('data-memo');
                sendData.order_id = $(this).attr('data-id');
                sendData.user_id = $(this).attr('data-user_id');
                config.target = $(this);
                config.position = 'right';
                config.content = '<div><textarea class="form-control form-control-md j-memo" maxlength="200">' + memo + '</textarea></div>';
                that.tip(config, function (btn, dialog) {
                    sendData.memo = $.trim($('.j-memo').val());
                    that.addMemo(sendData);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                })
            });

            // 发货
            $(document).on('click', '.j-send-goods', function () {
                var orderInfo = JSON.parse(decodeURIComponent($(this).attr('data-orderinfo')));
                var refundMark = $(this).attr('data-refund_mark');
                var order_id = $(this).attr('data-order_id');
                var user_id = $(this).attr('data-user_id');

                // 发货的时候存在 维权商品
                if (refundMark && refundMark == 1) {
                    toastr.error('订单中的部分商品，买家已提交了维权申请，您需要先处理（同意或拒绝）买家退款申请后，才能够进行发货操作。', '提示');
                    return false;
                }

                var data = {};
                data.title = '商品发货';
                data.content = '<div id="orderInfo"></div>';
                data.width = 800;
                that.popup(data, function () {
                    var template = _.template($('#j-template-send-goods').html());
                    $('#orderInfo').html(template({
                        item: orderInfo,
                        orderStatus: that.orderStatusData
                    }));
                    that.iCheck();
                    that.queryLogisticsCompany();
                }, function (btn, dialog) {
                    // 确定操作
                    var sendGoodsData = {};
                    var checkedBox = $('.checkbox:checked');
                    var needLogistics = $('input[name=logistics]:checked').attr('data-value');
                    var delivery_company = $('#logisticsList').val();
                    var delivery_code = $.trim($('#logisticCode').val());
                    var orderItem_ids = [];

                    if (checkedBox.length < 1) {
                        toastr.error('请选择要发货的商品', '提示');
                        return false;
                    }

                    if (needLogistics == 1) {
                        // 需要物流
                        if (delivery_company == '请选择物流公司' || delivery_company == '') {
                            toastr.error('请选择物流公司', '提示');
                            return false;
                        }

                        if (delivery_code == '') {
                            toastr.error('请填写物流单号', '提示');
                            return false;
                        }
                        sendGoodsData.delivery_company = delivery_company;
                        sendGoodsData.delivery_code = delivery_code;
                    }

                    for (var i = 0; i < checkedBox.length; i++) {
                        orderItem_ids.push(checkedBox.eq(i).attr('data-id'));
                    }


                    sendGoodsData.need_delivery = (needLogistics == 1 ? 'y' : 'n');
                    sendGoodsData.order_id = order_id;
                    sendGoodsData.user_id = user_id;
                    sendGoodsData.orderItem_ids = orderItem_ids.toString();

                    console.log(sendGoodsData);
                    that.sendGoods(sendGoodsData, function () {
                        dialog.close();
                    });
                });
            });
        },
        iCheck: function () {
            var that = this;
            if ($("input.flat")[0]) {
                $(document).ready(function () {
                    $('input.flat').iCheck({
                        checkboxClass: 'icheckbox_flat-green',
                        radioClass: 'iradio_flat-green'
                    });
                });
            }

            // checked
            $('#check-all').on('ifClicked', function () {
                if (this.checked) {
                    $('.checkbox').iCheck('uncheck');
                } else {
                    $('.checkbox').iCheck('check');
                }
            });

            $('.checkbox').on('ifChecked', function () {
                var checkedBox = $('.checkbox:checked');
                var checkbox = $('.checkbox');

                if (checkbox.length == checkedBox.length) {
                    $('#check-all').iCheck("check");
                } else {
                    $('#check-all').iCheck("uncheck");
                }
                $(this).parents('tr').addClass('selected');
            });

            $('.checkbox').on('ifUnchecked', function () {
                var checkedBox = $('.checkbox:checked');
                var checkbox = $('.checkbox');

                if (checkbox.length == checkedBox.length) {
                    $('#check-all').iCheck("check");
                } else {
                    $('#check-all').iCheck("uncheck");
                }
                $(this).parents('tr').removeClass('selected');
            })
        },
        /**
         * tip
         * @param data
         * @param success
         * @param fail
         */
        tip: function (data, success, fail) {
            this.dialogTip = jDialog.tip(data.content, {
                target: data.target,
                position: data.position || 'left'
            }, {
                width: data.width || 200,
                closeable: false,
                closeOnBodyClick: true,
                buttonAlign: 'center',
                buttons: [{
                    type: 'highlight',
                    text: '确定',
                    handler: function (button, dialog) {
                        success && success(button, dialog)
                    }
                }, {
                    type: 'highlight',
                    text: '取消',
                    handler: function (button, dialog) {
                        fail && fail(button, dialog)
                    }
                }]
            });
        },
        popup: function (data, cb, success) {
            this.popupDialog = jDialog.dialog({
                title: data.title,
                content: data.content,
                width: data.width || 600,
                height: 600,
                draggable: false,
                buttonAlign: 'right',
                buttons: [{
                    type: 'highlight',
                    text: '确定',
                    handler: function (button, dialog) {
                        success && success(button, dialog)
                    }
                }, {
                    type: 'highlight',
                    text: '取消',
                    handler: function (button, dialog) {
                        dialog.close();
                    }
                }]
            });
            cb && cb();
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
        /**
         * 时间选择插件
         */
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
        },
        /**
         * 订单列表
         */
        queryOrderList: function () {
            var that = this;
            $.ajax({
                url: that.api + '/order/query.do',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    current_page: that.pageId,
                    page_size: that.page.pageSize,
                    order_sn: '',
                    consignee_mobile: '',
                    start_time: '',
                    end_time: '',
                    order_status: '',
                    consignee: '',
                    user_mobile: '',
                    payment_id: '',
                    asterisk_mark: '',
                    print_mark: ''
                },
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        if (data.data.total_count > 0) {
                            var tpl = _.template($('#j-template-order').html());
                            $('#orderList').html(tpl({
                                items: data.data.data,
                                orderStatus: that.orderStatusData
                            }));
                        } else {
                            $('#orderList').html('<table class="table"><tbody><tr><td class="tc" colspan="7">没有任何记录!</td></tr></tbody></table>');
                        }
                        that.pagination(data.data.total_count);
                    } else {
                    }
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 获取物流公司.
         */
        queryLogisticsCompany: function () {
            var that = this;
            $.ajax({
                url: that.api + '/order/queryLogisticsCompany.do',
                type: 'get',
                dataType: 'jsonp',
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        var tpl = _.template($('#j-template-logistics').html());
                        $('#logisticsList').html(tpl({
                            items: data.data
                        }));
                    }
                    // 物流属性切换
                    $('input[name=logistics]').on('ifChecked', function () {
                        var value = $(this).attr('data-value');
                        if (value == 1) {
                            // 需要物流
                            $('.logistics-info').show();
                        } else {
                            // 不需要物流
                            $('.logistics-info').hide();
                        }
                    })
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 加星
         * @param data
         */
        addStar: function (data) {
            var that = this;
            $.ajax({
                url: that.api + '/order/updateAsteriskMark.do',
                type: 'get',
                dataType: 'jsonp',
                data: data,
                beforeSend: function () {

                },
                success: function (d) {
                    if (d.code == 10000) {
                        that.queryOrderList();
                    }
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 备注
         */
        addMemo: function (data) {
            var that = this;
            $.ajax({
                url: that.api + '/order/updateMemo.do',
                type: 'get',
                dataType: 'jsonp',
                data: data,
                beforeSend: function () {

                },
                success: function (d) {
                    if (d.code == 10000) {
                        that.queryOrderList();
                    }
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 发货api
         */
        sendGoods: function (sendData, cb) {
            var that = this;
            $.ajax({
                url: that.api + '/order/delivery.do',
                type: 'get',
                dataType: 'jsonp',
                data: sendData,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        toastr.success('发货成功', '提示');
                        that.queryOrderList();
                        cb && cb(data);
                    }
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 翻页
         * @param total 总数据量
         */
        pagination: function (total) {
            var that = this;
            var pagination = $('.ui-pagination')
            pagination.jqPaginator({
                totalCounts: total == 0 ? 10 : total,                            // 设置分页的总条目数
                pageSize: that.page.pageSize,                                    // 设置每一页的条目数
                visiblePages: that.page.vpage,                                   // 设置最多显示的页码数
                currentPage: that.pageId,                                        // 设置当前的页码
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    that.pageId = num;
                    if (type == 'change') {
                        that.queryOrderList();
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
            var n = $('#orderList').find('table').length;
            if (total && total != 0) {
                $('.pagination-info').html('<span>当前' + n + '条</span>/<span>共' + total + '条</span>')
            } else {
                $('.pagination-info').html('<span>当前0条</span>/<span>共' + total + '条</span>')
            }
        }
    };
    // run
    $(function () {
        main.init();
    })
})();