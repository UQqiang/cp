/**
 * Created by lijiahao on 17/1/9.
 */
;(function () {
    var main = {
        init: function () {
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;
            this.search_key = {};
            this.categoryId = '';
            this.currentCateObj = {};
            $('#categoryChildren').hide();
            this.queryBrand();
            this.queryCategory();
            this.queryGoods();
            this.addEvent();
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
        addEvent: function () {
            var that = this;

            // 搜索
            $('#search').click(function () {
                that.pageId = 1;
                that.search_key.brand_key = $('#brandList option:selected').attr('value');
                that.search_key.category_id = that.currentCateObj['2'] ? that.currentCateObj['2'].id : '';
                that.search_key.key = $.trim($('#key').val());
                that.queryGoods();
            });

            // tab
            $('#goodsTab li').click(function () {

                if ($(this).hasClass('active')) {
                    return false;
                }
                // 重置搜索状态
                that.search_key.item_status = $(this).attr('data-type');
                // 重置页码
                that.pageId = 1;
                if (that.search_key.item_status == -1) {
                    $('#j-batch-trash').hide();
                    $('#j-batch-restore,#j-batch-delete').show();
                } else {
                    $('#j-batch-trash').show();
                    $('#j-batch-restore,#j-batch-delete').hide();
                }
                that.queryGoods();
            });

            // 加入回收站
            $(document).on('click', '.j-trash', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                data.target = $(this);
                data.content = '确定要将商品:' + name + '加入回收站吗?';
                that.tip(data, function (btn, dialog) {
                    that.trashGoods(id);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 批量加入回收站
            $(document).on('click', '#j-batch-trash', function () {
                var data = {};
                var idList = [];
                var checkedBox = $('.checkbox:checked');
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                data.target = $(this);
                data.content = '确定要将选中的商品加入回收站吗?';
                data.position = 'right';
                that.tip(data, function (btn, dialog) {
                    that.batchTrashGoods(JSON.stringify(idList));
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 删除
            $(document).on('click', '.j-delete', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                data.target = $(this);
                data.content = '确定要将商品:' + name + '彻底删除吗?';
                that.tip(data, function (btn, dialog) {
                    that.deleteGoods(id);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 批量删除
            $(document).on('click', '#j-batch-delete', function () {
                var data = {};
                var idList = [];
                var checkedBox = $('.checkbox:checked');
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                data.target = $(this);
                data.content = '确定要将选中的商品彻底删除吗?';
                data.position = 'right';
                that.tip(data, function (btn, dialog) {
                    that.batchDeleteGoods(JSON.stringify(idList));
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 恢复
            $(document).on('click', '.j-restore', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                data.target = $(this);
                data.content = '确定要将商品:' + name + '恢复吗?';
                that.tip(data, function (btn, dialog) {
                    that.recoveryGoods(id);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 批量恢复
            $(document).on('click', '#j-batch-restore', function () {
                var data = {};
                var idList = [];
                var checkedBox = $('.checkbox:checked');
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                data.target = $(this);
                data.content = '确定要将选中的商品全部恢复吗?';
                data.position = 'right';
                that.tip(data, function (btn, dialog) {
                    that.batchRecoveryGoods(JSON.stringify(idList));
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 成本价goodsSkuList
            $(document).on('click', '.j-edit-cost-price', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                data.title = '成本价';
                data.content = $('#j-template-sku').html();
                data.width = 800;
                that.popup(data, function () {
                    that.goodsSkuList(id, name)
                }, function () {

                })
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
         * 获取类目
         */
        queryCategory: function () {
            var that = this;
            Api.get({
                url: '/category/leaf/query.do',
                data: {},
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    if (data.code === 10000) {
                        var template = _.template($('#j-template-category').html());

                        // 渲染一级类目
                        $('#add-goods-category-1').html(template({
                            items: data.data,
                            type: 1
                        }));

                        // 类目的点击事件
                        $(document).on('change', '.categories', function () {
                            var id = $(this).find('option:selected').attr('value');
                            var parent_id = $(this).find('option:selected').attr('data-parent_id');
                            var level = $(this).find('option:selected').attr('data-cate_level');
                            var subCate = $(this).find('option:selected').attr('data-sub_cate');

                            if (subCate && subCate != 'undefined') {
                                subCate = JSON.parse(decodeURIComponent(subCate));
                            }
                            if (id) {
                                $('#categoryChildren').show();
                            } else {
                                $('#categoryChildren').hide();
                                that.currentCateObj = {};
                            }
                            if (parent_id == 0) {
                                // 点击的是一级类目
                                // 一级类目移除active
                                that.categoryId = id;
                                $('#add-goods-category-2').html(template({
                                    items: subCate,
                                    type: 2
                                }));
                                that.currentCateObj = {};

                            } else {
                                // 点击的是二级类目
                                that.categoryId = parent_id;
                            }
                            that.currentCateObj[level] = {
                                id: id,
                                parent_id: parent_id,
                                level: level
                            };
                            console.log('cateOBJ:' + JSON.stringify(that.currentCateObj))
                        });
                    }
                },
                complete: function () {
                },
                error: function (data) {

                }
            })
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
                    var t = _.template($('#j-template-brand').html());
                    $('#brandList').html(t({
                        items: data.data.data
                    }));
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 商品列表
         */
        queryGoods: function () {
            var that = this;
            Api.get({
                url: '/item/query.do',
                data: {
                    current_page: that.pageId || 1,
                    page_size: that.page.pageSize || 20,
                    key: that.search_key.key || '',
                    brand_key: that.search_key.brand_key || '',
                    category_id: that.search_key.category_id || '',
                    item_status: that.search_key.item_status || ''
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    // 滚动条自动回顶部
                    document.getElementsByTagName('body')[0].scrollTop = 0;
                    var total_count = data.data.total_count;
                    if (total_count > 0) {
                        var t = _.template($('#j-template').html());
                        $('#goodsList').html(t({
                            items: data.data.data,
                            type: that.search_key.item_status
                        }));
                        that.iCheck();
                    } else {
                        $('#goodsList').html('<tr><td class="tc" colspan="18">没有任何记录!</td></tr>')
                    }

                    that.pagination(data.data.total_count);
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 加入回收站
         */
        trashGoods: function (id) {
            var that = this;
            Api.get({
                url: '/item/trash.do',
                data: {
                    item_id: id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('加入回收站成功', '提示');
                    that.queryGoods();
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 批量加入回收站
         */
        batchTrashGoods: function (idList) {
            var that = this;
            Api.get({
                url: '/item/batch_trash.do',
                data: {
                    item_id_list: idList
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('批量加入回收站成功', '提示');
                    that.queryGoods();
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 删除
         */
        deleteGoods: function (id) {
            var that = this;
            Api.get({
                url: '/item/delete.do',
                data: {
                    item_id: id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('删除成功', '提示');
                    that.queryGoods();
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 批量删除
         */
        batchDeleteGoods: function (idList) {
            var that = this;
            Api.get({
                url: '/item/batch_delete.do',
                data: {
                    item_id_list: idList
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('批量删除成功', '提示');
                    that.queryGoods();
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 恢复
         */
        recoveryGoods: function (id) {
            var that = this;
            Api.get({
                url: '/item/recovery.do',
                data: {
                    item_id: id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('恢复成功', '提示');
                    that.queryGoods();
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 批量恢复
         */
        batchRecoveryGoods: function (idList) {
            var that = this;
            Api.get({
                url: '/item/batch_recovery.do',
                data: {
                    item_id_list: idList
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('批量恢复成功', '提示');
                    that.queryGoods();
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
        pagination: function (total) {
            var that = this;
            var pagination = $('.ui-pagination');
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
                        that.queryGoods()
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
            var n = $('#goodsList').find('tr.list').length;
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