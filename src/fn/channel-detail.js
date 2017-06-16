/**
 * Created by lijiahao on 17/3/2.
 */
;(function () {
    var main = {
        init: function () {
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;
            this.search_key_shop = {};
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
            var url_search = window.location.search || '';
            this.type = url_search ? url_search.split('=')[1] : 'shop';
            this.search_key = {};
            this.dateTimerPick();
            this.addEvent();
            if (this.type == 'shop') {
                $('.form-inline-shop').fadeIn();
                this.queryShopList(this.type);
            }else {
                $('#switchTab li').removeClass('active');
                $('#switchTab').find('.switch-tab-'+this.type).addClass('active');
                this.queryList(this.type);
            }
        },
        addEvent: function () {
            var that = this;

            // 搜索
            $('.search-submit').click(function () {
                that.pageId = 1;
                var id = $(this).attr('id');
                switch (id) {
                    case 'searchShop':
                        that.queryShopList('shop');
                        break;
                    case 'searchPartner':
                    that.queryList();

                        break;
                    case 'searchOrder':
                    that.queryList();

                        break;
                }
            });

            $('#switchTab li').click(function (e) {

                if ($(this).hasClass('active')) {
                    return false;
                }
                that.type = $(this).data('type');
                history.replaceState(null, null, "?type="+that.type);

                // 重置时间为空
                that.search_key.start_time = '';
                that.search_key.end_time = '';

                // 重置页码
                that.pageId = 1;
                that.queryList(that.type);
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
        // tip: function (data, success, fail) {
        //     this.dialogTip = jDialog.tip(data.content, {
        //         target: data.target,
        //         position: data.position || 'left'
        //     }, {
        //         width: data.width || 200,
        //         closeable: false,
        //         closeOnBodyClick: true,
        //         buttonAlign: 'center',
        //         buttons: [{
        //             type: 'highlight',
        //             text: '确定',
        //             handler: function (button, dialog) {
        //                 success && success(button, dialog)
        //             }
        //         }, {
        //             type: 'highlight',
        //             text: '取消',
        //             handler: function (button, dialog) {
        //                 fail && fail(button, dialog)
        //             }
        //         }]
        //     });
        // },
        // popup: function (data, cb, success) {
        //     this.popupDialog = jDialog.dialog({
        //         title: data.title,
        //         content: data.content,
        //         width: data.width || 600,
        //         height: 600,
        //         draggable: false,
        //         buttonAlign: 'right',
        //         buttons: [{
        //             type: 'highlight',
        //             text: '确定',
        //             handler: function (button, dialog) {
        //                 success && success(button, dialog)
        //             }
        //         }, {
        //             type: 'highlight',
        //             text: '取消',
        //             handler: function (button, dialog) {
        //                 dialog.close();
        //             }
        //         }]
        //     });
        //     cb && cb();
        // },
        timepicker: function () {
            $('.timepicker').daterangepicker({
               startDate: moment().subtract(29, 'days'),
               endDate: moment()
            }, function(start, end, label) {
               console.log(start.format('YYYY-MM-DD'));
               console.log(end.format('YYYY-MM-DD'));
            });
            $('.timepicker').daterangepicker({
               singleDatePicker: true,
               singleClasses: "picker_1"
            }, function(start, end, label) {
               console.log(start.toISOString(), end.toISOString(), label);
            });
        },
        /**
         * 时间选择插件
         */
        dateTimerPick: function () {
            var that = this;
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
            $('.timepicker').daterangepicker(optionSet1, function (start, end, label) {
                console.log(start.toISOString(), end.toISOString(), label);
                $('.timepicker span').text(start.format('YYYY-MM-DD') + ' ~ ' + end.format('YYYY-MM-DD'));
                that.search_key.start_time = start.format('YYYY-MM-DD');
                that.search_key.end_time = end.format('YYYY-MM-DD');
            });

            $('.timepicker').on('cancel.daterangepicker', function (ev, picker) {
                $(this).find('span').text('请选择相应的时间');
                that.search_key.start_time = '';
                that.search_key.end_time = '';
            });
        },

        queryShopList: function (type) {
            var that = this;
            var status = $.trim($('#shopStatusSearch').val());
            that.search_key_shop = {
                dist_username: $.trim($('#shopNoSearch').val()) || '',
                shop_name: $.trim($('#shopNameSearch').val()) || '',
                status: status > 0 ? status-1 : '',
                start_time: that.search_key.start_time || '',
                end_time: that.search_key.end_time || '',
                order_key: 0,
                order_type: 2
            }
            var data = {
                dist_username: that.search_key_shop.dist_username,
                shop_name: that.search_key_shop.shop_name,
                start_time: that.search_key_shop.start_time,
                end_time: that.search_key_shop.end_time,
                status: that.search_key_shop.status,
                order_key: that.search_key_shop.order_key,
                order_type: that.search_key_shop.order_type,
                current_page: that.pageId,
                page_size: that.page.pageSize
            }
            Api.get({
                url: '/share_partner/shop/query.do',
                data: data,
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    // 数据展示banner
                    if (data.data.shop_sum) {
                        var tpl = _.template($('#j-template-shopSumList').html());
                        $('#shopSumList').html(tpl({
                            item: data.data.shop_sum
                        }));
                    }
                    // 店铺列表
                    if (type == 'shop') {
                        var shopResData = data.data.lower_partner_list || '';
                        if (shopResData) {
                            if (shopResData.length > 0) {
                                var tpl = _.template($('#j-template-shop').html());
                                $('#dataLists').html(tpl({
                                    items: shopResData
                                }));
                            }else {
                                $('#dataLists').html('<table class="table"><tbody><tr><td class="tc" colspan="7">没有任何记录!</td></tr></tbody></table>');
                            }
                        }
                        that.pagination(data.data.total_partner_count);
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
         * 要生成的列表因类型不同请求不同的接口
         */
        queryList: function (type) {
            var that = this;
            $('.form-inline').fadeOut();
            switch (type) {
                case 'shop':
                    $('.form-inline-shop').fadeIn();
                    that.queryShopList(type);
                    break;
                case 'partner':
                    $('.form-inline-partner').fadeIn();
                    that.queryShopList(type);
                    var url = '/share_partner/query.do';
                    var status = $.trim($('#partnerStatusSearch').val());
                    that.search_key_partner = {
                        dist_username: $.trim($('#partnerShopSearch').val()) || '',
                        shop_name: '',
                        status: status > 0 ? status-1 : '',
                        start_time: that.search_key.start_time || '',
                        end_time: that.search_key.end_time || '',
                        order_key: 0,
                        order_type: 2
                    }
                    var data = {
                        dist_username: that.search_key_partner.dist_username,
                        shop_name: that.search_key_partner.shop_name,
                        start_time: that.search_key_shop.start_time,
                        end_time: that.search_key_shop.end_time,
                        status: that.search_key_partner.status,
                        order_key: that.search_key_partner.order_key,
                        order_type: that.search_key_partner.order_type,
                        current_page: that.pageId,
                        page_size: that.page.pageSize
                    }
                    this.requestApi(url,data);
                    break;
                case 'order':
                    $('.form-inline-order').fadeIn();
                    that.queryShopList(type);
                    var url = '/share_partner/shop/query.do';
                    that.search_key_order = {
                        dist_username: $.trim($('#shopNoSearch').val()) || '',
                        shop_name: $.trim($('#shopNameSearch').val()) || '',
                        start_time: '',
                        end_time: '',
                        order_key: 0,
                        order_type: 2
                    }
                    var data = {
                        dist_username: that.search_key_shop.dist_username,
                        shop_name: that.search_key_shop.shop_name,
                        start_time: that.search_key_shop.start_time,
                        end_time: that.search_key_shop.end_time,
                        status: that.search_key_shop.status,
                        order_key: that.search_key_shop.order_key,
                        order_type: that.search_key_shop.order_type,
                        current_page: that.pageId.current_page,
                        page_size: that.page.pageSize
                    }
                    this.requestApi(url,data);
                    break;
            }
        },

        requestApi: function (url,data) {
            var that = this;
            Api.get({
                url: url,
                data: data,
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    // 分享合伙人
                    // var partnerResData = data.data.lower_partner_list || '';
                    // if (partnerResData) {
                        // if (partnerResData.length > 0) {
                            var tpl = _.template($('#j-template-partner').html());
                            $('#dataLists').html(tpl({
                                items: JSON.stringify([2,3])
                            }))

                        // }else {
                        //     $('#partnerList').html('<table class="table"><tbody><tr><td class="tc" colspan="7">没有任何记录!</td></tr></tbody></table>');
                        // }
                    // }

                    // 订单统计

                    that.pagination(6);
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
        // queryLogisticsCompany: function () {
        //     var that = this;
        //     Api.get({
        //         url: '/order/queryLogisticsCompany.do',
        //         data: {},
        //         beforeSend: function () {
        //
        //         },
        //         success: function (data) {
        //             var tpl = _.template($('#j-template-logistics').html());
        //             $('#logisticsList').html(tpl({
        //                 items: data.data
        //             }));
        //             // 物流属性切换
        //             $('input[name=logistics]').on('ifChecked', function () {
        //                 var value = $(this).attr('data-value');
        //                 if (value == 1) {
        //                     // 需要物流
        //                     $('.logistics-info').show();
        //                 } else {
        //                     // 不需要物流
        //                     $('.logistics-info').hide();
        //                 }
        //             })
        //         },
        //         complete: function () {
        //
        //         },
        //         error: function (data, msg) {
        //             console.log(data, msg);
        //         }
        //     });
        // },
        /**
         * 加星
         * @param data
         */
        // addStar: function (data) {
        //     var that = this;
        //     Api.get({
        //         url: '/order/updateAsteriskMark.do',
        //         data: data,
        //         beforeSend: function () {
        //
        //         },
        //         success: function (d) {
        //             toastr.success('加星成功', '提示');
        //             that.queryOrderList();
        //         },
        //         complete: function () {
        //
        //         },
        //         error: function (data, msg) {
        //             console.log(data, msg);
        //         }
        //     });
        // },
        /**
         * 备注
         */
        // addMemo: function (data) {
        //     var that = this;
        //     Api.get({
        //         url: '/order/updateMemo.do',
        //         data: data,
        //         beforeSend: function () {
        //
        //         },
        //         success: function (d) {
        //             that.queryOrderList();
        //         },
        //         complete: function () {
        //
        //         },
        //         error: function (data, msg) {
        //             console.log(data, msg);
        //         }
        //     });
        // },
        /**
         * 发货api
         */
        // sendGoods: function (sendData, cb) {
        //     var that = this;
        //     Api.get({
        //         url: '/order/delivery.do',
        //         data: sendData,
        //         beforeSend: function () {
        //
        //         },
        //         success: function (data) {
        //             toastr.success('发货成功', '提示');
        //             that.queryOrderList();
        //             cb && cb(data);
        //         },
        //         complete: function () {
        //
        //         },
        //         error: function (data, msg) {
        //             console.log(data, msg);
        //         }
        //     });
        // },
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
                first: '<a class="first" href="javascript:;">&lt;&lt;<\/a>',
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                last: '<a class="last" href="javascript:;">&gt;&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    that.pageId = num;
                    if (type == 'change') {
                        that.queryList(that.type);
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
