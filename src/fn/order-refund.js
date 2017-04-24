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
            this.order_id = HDL.getQuery('order_id');
            this.user_id = HDL.getQuery('user_id');
            this.order_item_id = HDL.getQuery("order_item_id");
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
            this.getRefundDetail(function () {
            });
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

            // search
            $('#search').click(function () {
                that.search_key = $.trim($('#keywords').val());
                that.pageId = 1;
                that.queryBrand();
            });

            $('#batchDelete').click(function () {
                var checkedBox = $('.checkbox:checked');
                var idList = [];
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                var data = {};
                data.target = $(this);
                data.content = '确定要批量删除品牌吗?';
                that.tip(data, function (btn, dialog) {
                    console.log(idList);
                    //that.deleteBrand(idList, function (data) {
                    //    toastr.success('已成功批量删除', '提示');
                    //    that.queryBrand();
                    //}, function (data) {
                    //    toastr.error(data.msg)
                    //});
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // delete
            $(document).on('click', '.j-brand-delete', function () {
                var id = $(this).attr('data-id');
                var name = $(this).attr('data-name');
                var data = {};
                data.target = $(this);
                data.content = '确定要删除品牌' + name + '吗?';
                that.tip(data, function (btn, dialog) {
                    that.deleteBrand(id, function (data) {
                        toastr.success('已成功删除' + name, '提示');
                        that.queryBrand();
                    }, function (data) {
                        toastr.error(data.msg)
                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            })
        },
        /**
         * 订单详情
         */
        getRefundDetail: function (cb) {
            var that = this;
            $.ajax({
                url: that.api + '/refund//detail.do',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    order_id: that.order_id,
                    user_id: that.user_id,
                    order_item_id: that.order_item_id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        // 滚动条自动回顶部
                        document.getElementsByTagName('body')[0].scrollTop = 0;

                        var t = _.template($('#j-template').html());
                        $('#orderRefundDetail').html(t({
                            items: data.data.return_items,
                            data:data.data,
                            orderStatus: that.payTypeData
                        }));

                        var t2 = _.template($('#j-template-refund').html());
                        $('#orderRefundList').html(t2({
                            items: data.data.return_items
                        }));
                        that.order_sn = data.data.order_sn;

                        cb && cb();

                    } else {
                        toastr.error(data.msg, '提示');
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        }
    };
    // run
    $(function () {
        main.init();
    })
})();