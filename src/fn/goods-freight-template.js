/**
 * Created by kyn on 17/3/13.
 */
;(function () {
    var main = {
        init: function () {
            this.api = Api.domain();
            this.render();
            this.addEvent();

        },
        //todo 运费模板搜索没写
        /**
         * tip
         * @param data
         * @param success
         * @param fail
         */
        tip: function (data, success, fail) {
            var dialogTip = jDialog.tip(data.content, {
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

            // 复制
            $('body').on('click', '.J_copy', function (e) {
                e.preventDefault();
                var id = $(this).attr('data-id');
                var data = {
                    id: id
                };
                var config = {};
                config.content = '确定要复制该模板吗?';
                config.target = $(this);
                that.tip(config, function (btn, dialog) {
                    that.copyCarriageTpl(data);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });
            // 删除模板按钮
            $('body').on('click', '.J_del', function (e) {
                e.preventDefault();
                var id = $(this).attr('data-id');
                var target = $(this);
                var content = '确定要删除该运费模板吗？';
                var position = 'left';
                that.popupDelTip(target, content, position, id);

            })
        },
        // 复制模板
        copyCarriageTpl: function (data) {
            var that = this;
            $.ajax({
                url: that.api + "/freight/copy.do",
                dataType: "jsonp",
                type: "get",
                data: data,
                success: function (d) {
                    if (d.code == 10000) {
                        toastr.success('复制成功', '提示');
                        that.render()
                    } else {
                        toastr.error(d.msg, '提示')
                    }
                },
                error: function (d) {
                    toastr.error(d.msg, '提示');
                }
            })
        },
        popupDelTip: function (target, content, position, id) {         //type 1多项删除 2 单项删除 3 改名
            var that = this;
            var dialog = jDialog.tip(content, {
                target: target,
                position: position
            }, {
                width: 200,
                closeable: false,
                closeOnBodyClick: true,
                buttonAlign: 'center',
                buttons: [{
                    type: 'highlight',
                    text: '确定',
                    handler: function (button, dialog) {
                        that.deleteCarriageTpl(id);
                        dialog.close()
                    }
                }, {
                    type: 'highlight',
                    text: '取消',
                    handler: function (button, dialog) {
                        dialog.close();
                    }
                }]
            });

        },
        // 删除模板
        deleteCarriageTpl: function (id) {
            var that = this;
            $.ajax({
                url: that.api + "/freight/delete.do",
                dataType: "jsonp",
                type: "get",
                data: {
                    id: id
                },
                success: function (d) {
                    if (d.code == 10000) {
                        toastr.success('删除成功', '提示');
                        that.render()
                    } else {
                        toastr.error(d.msg, '提示')
                    }
                },
                error: function (d) {
                    toastr.error(d.msg, '提示');
                }
            })
        },
        render: function () {
            var that = this;
            $.ajax({
                url: that.api + "/freight/query.do",
                dataType: "jsonp",
                type: "get",
                success: function (data) {
                    that.templateShow(data)
                },
                error: function (d) {
                    toastr.error(d.msg, '错误提示');
                }
            })
        },
        templateShow: function (data) {
            var $tpl1 = $("#tpl").html();
            console.log(data);
            $(".template-main").html(_.template($tpl1)({
                data: data.data.freight_template_dto_list
            }));

        }
    };
    $(function () {
        main.init()
    })
})();