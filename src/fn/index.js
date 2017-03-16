/**
 * Created by lijiahao on 17/1/9.
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
            this.categoryId = '';
            this.currentCateObj = {};
            // 初始化提示框
            toastr.options = ({
                progressBar: true,
                positionClass: "toast-top-center"
            });
            $('#categoryChildren').hide();
            this.addEvent();
            this.queryBrand();
            this.queryCategory();
            this.queryGoods();
        },
        addEvent: function () {
            var that = this;

            $('#search').click(function () {
                that.pageId = 1;
                that.search_key.brand_key = $('#brandList option:selected').attr('value');
                that.search_key.category_id = that.currentCateObj['2'] ? that.currentCateObj['2'].id : '';
                that.search_key.key = $.trim($('#key').val());
                that.queryGoods();
            })
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
            $.ajax({
                url: that.api + '/category/leaf/query.do',
                type: 'get',
                dataType: 'jsonp',
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
                            if(id){
                                $('#categoryChildren').show();
                            }else{
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
            $.ajax({
                url: that.api + '/brand/query.do',
                type: 'get',
                dataType: 'jsonp',
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        var t = _.template($('#j-template-brand').html());
                        $('#brandList').html(t({
                            items: data.data.data
                        }));

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
        },
        /**
         * 商品列表
         */
        queryGoods: function () {
            var that = this;
            $.ajax({
                url: that.api + '/item/query.do',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    current_page: that.pageId || 1,
                    page_size: that.page.pageSize || 20,
                    key: that.search_key.key || '',
                    brand_key: that.search_key.brand_key || '',
                    category_id: that.search_key.category_id || ''
                },
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        // 滚动条自动回顶部
                        document.getElementsByTagName('body')[0].scrollTop = 0;
                        var total_count = data.data.total_count;
                        if (total_count > 0) {
                            var t = _.template($('#j-template').html());
                            $('#goodsList').html(t({
                                items: data.data.data
                            }));
                            that.iCheck();
                        } else {
                            $('#goodsList').html('<tr><td class="tc" colspan="18">没有任何记录!</td></tr>')
                        }

                        that.pagination(data.data.total_count);
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
        },
        pagination: function (total) {
            var that = this;
            var pagination = $('.ui-pagination');
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