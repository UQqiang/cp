;(function () {
    var main = {
        init: function () {
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;
            this.search_key = {};
            this.order_id = HDL.getQuery('order_id');
            this.user_id = HDL.getQuery('user_id');
            this.payTypeData = {
                '0': '优惠折扣',
                '1': '支付宝APP支付',
                '2': '微信支付APP支付',
                '3': '银联支付APP支付',
                '4': '支付宝wap支付',
                '5': '微信wap支付',
                '6': '银联wap支付',
                '7': '统统付APP',
                '8': '统统wap',
                '9': '余额支付'
            };
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
            this.addEvent();
            var that = this;
            this.getOrderDetail(function () {
                that.queryOrderList();
            });
            this.getOrderLogistic();
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
        addEvent: function () {
            var that = this;

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
        /**
         * 订单详情
         */
        getOrderDetail: function (cb) {
            var that = this;
            Api.get({
                url: '/order/get.do',
                data: {
                    order_id: that.order_id,
                    user_id: that.user_id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    // 滚动条自动回顶部
                    document.getElementsByTagName('body')[0].scrollTop = 0;

                    var t = _.template($('#j-template').html());
                    $('#orderDetail').html(t({
                        items: data.data,
                        payment: that.payTypeData,
                        orderStatus: that.orderStatusData
                    }));
                    that.order_sn = data.data.order_sn;

                    cb && cb();
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 获取物流信息
         */
        getOrderLogistic: function () {
            var that = this;
            Api.get({
                url: '/order/delivery/query.do',
                //url: '../src/stub/order_pxress.json',
                data: {
                    order_id: that.order_id,
                    user_id: that.user_id
                },
                beforeSend: function () {

                },
                success: function (data) {

                    // 滚动条自动回顶部
                    document.getElementsByTagName('body')[0].scrollTop = 0;

                    var template = _.template($('#j-template-logistic').html());
                    $('#orderLogistic').html(template({
                        items: data.data
                    }));

                    $('#orderLogistic a').click(function (e) {
                        e.preventDefault();
                        $(this).tab('show')
                    })

                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 订单列表
         */
        queryOrderList: function () {
            var that = this;
            Api.get({
                url: '/order/query.do',
                data: {
                    order_sn: that.order_sn
                },
                beforeSend: function () {

                },
                success: function (data) {
                    var tpl = _.template($('#j-template-order').html());
                    $('#orderList').html(tpl({
                        item: data.data.data[0],
                        orderStatus: that.orderStatusData
                    }));
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
            Api.get({
                url: '/order/queryLogisticsCompany.do',
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var tpl = _.template($('#j-template-logistics').html());
                    $('#logisticsList').html(tpl({
                        items: data.data
                    }));
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
         * 发货api
         */
        sendGoods: function (sendData, cb) {
            var that = this;
            Api.get({
                url: that.api + '/order/delivery.do',
                data: sendData,
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('发货成功', '提示');
                    that.getOrderDetail();
                    that.getOrderLogistic();
                    cb && cb(data);
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        }
    };
    // run
    $(function () {
        main.init();
    })
})();