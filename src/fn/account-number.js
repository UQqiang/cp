/**
 * Created by kyn on 17/3/1.
 */
;(function(){
    var main={
        init:function(){
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
        addEvent:function(){
            var that=this;
            $(".iCheck-helper").click(function(){
                if ($("#check-all").is("input:checked")){
                    $("input").prop("checked",true)
                }else{
                    $("input").prop("checked",false)
                }
            });

            $('input[name=radio-goods]').on('ifChecked', function () {
                if ($(this).val() == 2) {
                    // 国内商品
                    $('#rate').hide();
                } else {
                    // 跨进商品
                    $('#rate').show();
                }
            });
            //全选按钮逻辑
            $(".flat").click(function(){
                $("#check-all").prop("checked",false);
                $(".icheckbox_flat-green").removeClass("checked")
                if ($("input:checked").length==$("input[type='checkbox']").length-1){
                    $("#check-all").prop("checked",true)
                    $(".icheckbox_flat-green").addClass("checked")
                }
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
        },
        //渲染账号
        accountShow:function(data){
            var that = this;
            var $tpl1=$("#tpl").html();
            $("#j-list").html(_.template($tpl1)({
                data:data.data.data
            }));
            this.addEvent();
            //this.iCheck();
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
    };
    $(function(){
        main.init()
    })
})();
