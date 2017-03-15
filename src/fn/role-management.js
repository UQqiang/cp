/**
 * Created by kyn on 17/3/1.
 */
;(function(){
    var main={
        init:function(){
            this.toastrInit();
            this.api = Api.domain();
            this.render()
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
        render:function(){
            var that=this;
            $.ajax({
                url:that.api+"/userRole/query.do",
                dataType:"jsonp",
                type:"get",
                success:function(data){
                    that.mainShow(data)
                },
                error:function(){
                    toastr.error('网络错误');

                }
            })
        },
        mainShow:function(data){
            var tpl=$("#tpl").html()
            $("#tpl-main").html(_.template(tpl)({
                data:data.data.data
            }));
        }
    };
    $(function(){
        main.init()
    })
})();