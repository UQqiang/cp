/**
 * Created by lijiahao on 17/7/6.
 * vue first
 */
;(function () {
    var main = {
        init: function () {
            this.name = 1;
            this.pageId = 1;
            this.page = {};
            this.page.pageSize = 20;
            this.search_key = {};
            this.vueFunc();
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
        vueFunc: function () {
            var that = this;
            var app = new Vue({
                el: '#openShopHistory',
                data: {
                    searchValue: {
                        name: '',
                        channel: ''
                    },
                    channelList: [],
                    dataList: [],
                    total: ''
                },
                created: function () {
                    this.ajaxChannel();
                },
                mounted: function () {
                    $('#openShopHistory').show();
                },
                updated: function () {
                    var n = $('#historyList').find('tr.list').length;
                    if (this.total && this.total != 0) {
                        $('.pagination-info').html('<span>当前' + n + '条</span>/<span>共' + this.total + '条</span>')
                    } else {
                        $('.pagination-info').html('<span>当前0条</span>/<span>共' + this.total + '条</span>')
                    }
                },
                methods: {
                    searchInformation: function () {
                        var _self = this;

                        console.log(this.searchValue.name + this.searchValue.channel);

                        that.search_key.keywords = this.searchValue.name;

                        that.getData(function (res) {
                            _self.dataList = res.data.data;
                            _self.total = res.data.total_count;
                        })
                    },
                    ajaxChannel: function () {
                        var _self = this;

                        that.getChannelList(function (res) {
                            _self.channelList = res.data.data;
                        });

                        that.getData(function (res) {
                            _self.dataList = res.data.data;
                            _self.total = res.data.total_count;
                        });
                    },
                    freeze: function (e, currentData) {
                        var target = e.currentTarget;
                        var id = currentData.id;
                        var status = currentData.status;
                        var name = currentData.storage_name;
                        var _self = this;
                        that.tip({
                            target: target,
                            content: status == 1 ? '确定要关闭' + name + '吗?' : '确定要激活' + name + '吗?'
                        }, function (btn, dialog) {
                            toastr.success((status == 1 ? '关闭' : '激活') + name + '成功!', '提示');
                            for (var i = 0; i < _self.dataList.length; i++) {
                                if (_self.dataList[i].id == id) {
                                    _self.dataList[i].status = (status == 1 ? 2 : 1);
                                }
                            }
                            dialog.close();
                        }, function (btn, dialog) {
                            dialog.close();
                        })
                    }
                }
            });
        },
        /**
         * 渠道
         * @param cb
         */
        getChannelList: function (cb) {
            var that = this;
            Api.get({
                url: '/channel/control/query.do',
                data: {
                    current_page: that.pageId,
                    pageSize: 1000
                },
                beforeSend: function () {

                },
                success: function (res) {
                    cb && cb(res)
                },
                complete: function () {

                },
                error: function () {
                    toastr.error(data.msg, '提示');
                }
            })
        },
        getData: function (cb) {
            var that = this;
            Api.get({
                url: '/storage/query.do',
                data: {
                    storage_qto: JSON.stringify({
                        current_page: that.pageId || 1,
                        page_size: that.page.pageSize || 20,
                        need_paging: true,
                        keywords: that.search_key.keywords
                    })
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    cb && cb(data);
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
         * 翻页
         * @param total - 总页数
         */
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
                        that.getData()
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
        }
    };
    // run
    $(function () {
        main.init();
    })
})();