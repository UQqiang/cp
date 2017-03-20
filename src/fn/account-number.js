/**
 * Created by kyn on 17/3/1.
 */
;(function(){
    var main={
        init:function(){
            this.toastrInit();
            this.paginationCfg = {
                pageSize: 20,
                pageId: 1,
                visiblePages: 10
            };
            var data = {
            };
            this.api = Api.domain();
            this.render(data);

        },
        //todo search逻辑没写   禁用 删除逻辑没写



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
                width: 200,
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
        //请求渲染接口
        render:function(data){
            var that=this;
            $.ajax({
                url:this.api+"/employee/query.do",
                dataType:"jsonp",
                type:"get",
                data:{
                    current_page:that.paginationCfg.pageId < 2 ? '1' : (that.paginationCfg.pageId - 1) * that.paginationCfg.pageSize,
                    page_size:that.paginationCfg.pageSize,
                    user_name:data.user_name == undefined ? '':data.user_name,
                    name:data.name == undefined ? '':data.name,
                    status:data.status == undefined ? '':data.status
                },
                success:function(data){
                    that.accountShow(data)
                },
                error:function(data){
                    toastr.error('失败啦!');
                }
            })

        },
        /**
         * 初始化提示框
         */
        toastrInit: function () {
            toastr.options = ({
                progressBar: true,
                positionClass: "toast-top-center"
            });
        },

        addEvent:function(){
            var that=this;

            //删除
            $("body").on("click",".delete",function(){
                var id = $(this).attr("data-id");
                var data={};
                data.target = $(this);
                data.content = '确定要删除该运费模板吗?';
                that.tip(data, function (btn, dialog) {
                    that.accountDelete(id, function (data) {
                        toastr.success('已成功删除', '提示');
                        that.render();
                    }, function (data) {
                        toastr.error(data.msg)
                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });
            //禁用
            $("body").on("click",".J_disable",function(){
                var id = $(this).attr("data-id");
                var data={};
                data.target = $(this);
                data.content = '确定要禁用该运费模板吗?';
                that.tip(data, function (btn, dialog) {
                    that.accountDisable(id, function (data) {
                        toastr.success('已成功禁用', '提示');
                        that.render();
                    }, function (data) {
                        toastr.error(data.msg)
                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });

            });
            //批量删除
            $("body").on("click","#batchDelete",function(){
                var $checked = $("input:checked");
                var arr = [];
                var data={};
                data.target = $(this);
                data.content = '确定要批量删除吗?';
                for (var i= 0; i < $checked.length; i++) {
                    if ($checked.eq(i).attr("data-id")) {
                        arr.push($checked.eq(i).attr("data-id"))
                    }
                }
                that.tip(data, function (btn, dialog) {
                    that.batchDelete(arr, function (data) {
                        toastr.success('已成功删除', '提示');
                        that.render();
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
         * icheck定义
         */
        iCheck: function () {
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
        //渲染账号
        accountShow:function(data){
            var that = this;
            var $tpl1=$("#tpl").html();
            $("#j-list").html(_.template($tpl1)({
                data:data.data.data
            }));
            this.addEvent();
            this.iCheck();
        },
        //分页
        pagination: function (total) {
            var that = this;
            var pagination = $('.pagination');
            pagination.jqPaginator({
                totalCounts: total == 0 ? 1 : total, // 设置分页的总条目数
                pageSize: that.paginationCfg.pageSize,                          // 设置每一页的条目数
                visiblePages: that.paginationCfg.visiblePages,                  // 设置最多显示的页码数
                currentPage: that.paginationCfg.pageId,                         // 设置当前的页码
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    if (type == 'change') {
                        that.paginationCfg.pageId = num;
                        that.render();
                    }
                }
            });
        },
        //删除账号
        accountDelete:function(id){
            console.log(id)
        },
        //禁用账号
        accountDisable:function(id){
            console.log(id)
        },
        batchDelete:function(arr){
            console.log(arr)
        }
    };
    $(function(){
        main.init()
    })
})();
