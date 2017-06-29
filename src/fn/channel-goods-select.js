;(function () {
    var main = {
        init: function () {
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;
            this.search_key = {};
            this.categoryList = [];
            this.brandList = [];
            this.idList = JSON.parse(decodeURIComponent(HDL.getQuery('id').split(',')));

            if( !this.idList ){
                toastr.error('供应商信息出错!','提示');
                return false;
            }else{
                if(this.idList.length > 1){
                    // 多个供应商
                    $('.channel-name-list').show();
                    var template = _.template($('#j-template-channel-list').html());
                    $('.channel-name-lists').html(template({
                        items: this.idList
                    }))
                } else{
                    // 单个供应商
                    // todo 单个供应商需要请求已经关联的商品列表
                }
            }
            this.addEvent();
            this.queryBrand();
            this.queryCategory();
            this.selectPluginBrand();
            this.selectPluginGoods();
            this.selectPluginCategory();
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
        /**
         * 调用弹窗选择插件
         * 选择商品
         */
        selectPluginGoods: function () {
            var that = this;
            $('#selectPluginGoods').selectPlugin({
                single: false,
                isSku: false,
                isSelectAll: true,
                type: 0,
                title: '商品选择',
                selectLength: 0,
                selectedList: that.selectList,
                ajaxUrl: Api.domain() + '/item/query.do',
                ajaxType: 'get',
                ajaxDataType: 'jsonp',
                categoryList: that.categoryList || [],
                brandList: that.brandList || [],
                showCateAndBrand: true,
                selectSuccess: function (data) {
                    that.selectList = data;
                    // 选择商品进行渲染
                    that.renderGoods();
                    console.log(that.selectList);
                },
                selectError: function (info) {
                }
            })
        },
        /**
         * 调用弹窗选择插件
         * 选择品牌
         */
        selectPluginBrand: function () {
            var that = this;
            $('#selectPluginBrand').selectPlugin({
                single: false,
                isSku: false,
                isSelectAll: true,
                type: 4,
                title: '品牌选择',
                selectLength: 0,
                selectedList: that.selectList,
                ajaxUrl: Api.domain() + '/brand/query.do',
                ajaxType: 'get',
                ajaxDataType: 'jsonp',
                selectSuccess: function (data) {
                    that.selectList = data;
                    // 选择商品进行渲染
                    //that.renderGoods();
                    console.log(that.selectList);
                },
                selectError: function (info) {
                }
            })
        },
        /**
         * 调用弹窗选择插件
         * 选择类目
         */
        selectPluginCategory: function () {
            var that = this;
            $('#selectPluginCategory').selectPlugin({
                single: false,
                isSku: false,
                isSelectAll: true,
                type: 5,
                title: '类目选择',
                selectLength: 0,
                selectedList: that.selectList,
                ajaxUrl: Api.domain() + '/category/leaf/query.do',
                ajaxType: 'get',
                ajaxDataType: 'jsonp',
                selectSuccess: function (data) {
                    that.selectList = data;
                    // 选择商品进行渲染
                    //that.renderGoods();
                    console.log(that.selectList);
                },
                selectError: function (info) {
                }
            })
        },
        /**
         * 渲染商品列表
         */
        renderGoods: function () {
            var that = this;
            var template = _.template($('#j-template-goods').html());
            $('#goodsList').html(template({
                items: that.selectList
            }));
            // 恢复全选按钮的展示
            $('#check-all').iCheck("uncheck");
            that.iCheck();
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
            });

            $('#channel input[name=radio]').on('ifClicked', function () {
                var value = $(this).val();
                $('#channelButton a').hide();
                $('#channelButton a[data-value=' + value + ']').css({
                    display: 'inline-block'
                });
            })
        },
        addEvent: function () {
            var that = this;

            // iCheck
            $(document).on('ready', function () {
                that.iCheck();
            });

            // search
            $('#search').click(function () {
                that.search_key = $.trim($('#keywords').val());
                that.pageId = 1;
                that.queryBrand();
            });

            // batch delete
            $('#batchDelete').click(function () {
                var checkedBox = $('.checkbox:checked');
                var idList = [];
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                that.tip({
                    target: $(this),
                    content: '确定要批量删除已经选择的商品吗?',
                    position: 'right'
                }, function (btn, dialog) {

                    console.log(idList);
                    that.removeGoods(idList, function () {
                        toastr.success('已成功批量删除', '提示');
                        that.renderGoods();
                    });

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // delete
            $(document).on('click', '.j-channel-delete', function () {
                var id = $(this).attr('data-id');
                var name = $(this).attr('data-name');
                var idList = [];
                idList.push(id);
                that.tip({
                    target: $(this),
                    content: '确定要删除商品：' + name + '吗?'
                }, function (btn, dialog) {

                    that.removeGoods(idList, function () {
                        toastr.success('已成功删除：' + name, '提示');
                        that.renderGoods();
                    });

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 编辑结算价
            $(document).on('click', '.j-edit-price', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                that.popup({
                    title: '结算价',
                    content: $('#j-template-sku').html(),
                    width: 800
                }, function () {
                    that.goodsSkuList(id, name)
                }, function () {

                })
            });
        },
        /**
         * 删除 & 批量删除已经选择的关联商品
         * @param idList    要删除的关联商品的id数组
         * @param cb        删除完后的回调
         */
        removeGoods: function (idList, cb) {
            for (var i = 0; i < this.selectList.length; i++) {
                for (var n = 0; n < idList.length; n++) {
                    if (this.selectList[i].id == idList[n]) {
                        this.selectList.splice(i, 1);
                    }
                }
            }
            cb && cb();
        },
        /**
         * 品牌列表
         */
        queryBrand: function () {
            var that = this;
            Api.get({
                url: '/brand/query.do',
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var brand = data.data.data;
                    for (var i = 0; i < brand.length; i++) {
                        that.brandList.push({
                            text: brand[i].brand_name,
                            value: brand[i].id
                        });
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 类目列表
         */
        queryCategory: function () {
            var that = this;
            Api.get({
                url: '/category/query.do',
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var cate = data.data;
                    for (var i = 0; i < cate.length; i++) {
                        if (cate[i].cate_level == 2) {
                            that.categoryList.push({
                                text: cate[i].cate_name,
                                value: cate[i].id
                            });
                        }
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * sku
         */
        goodsSkuList: function (id, name) {
            var that = this;
            Api.get({
                url: '/item/sku/query.do',
                data: {
                    item_id: id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    console.log(data);
                    var template = _.template($('#j-template-sku-table').html());
                    $('#skuList').html(template({
                        items: data.data.skus,
                        name: name
                    }))
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 删除品牌
         */
        deleteBrand: function (id, success, error) {
            var that = this;
            Api.get({
                url: '/brand/delete.do',
                data: {
                    brand_id: id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    success && success(data);
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                    error && error(data);
                }
            });
        },
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
                        that.queryBrand()
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
            var n = $('#warehouseList').find('tr.list').length;
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