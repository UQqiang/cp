/**
 * Created by kyn on 17/2/24.
 */
;(function(){
    var main={
        init:function(){
            this.api = Api.domain();
            this.Verification();
            this.isGetData();
            this.addEvent();
        },
        // todo 提交逻辑没写,根据ID渲染页面逻辑没写完
        isGetData: function() {
            var that = this;
            var id = window.location.search.split('=')[1];
            if (id == undefined || (window.location.search.indexOf('?id=') == -1)) {
            } else {
                that.getData(id);
            }
        },
        //获取数据
        getData:function(id){
            var that=this;
            $.ajax({
                url:that.api+"/employee/get.do",
                dataType:"jsonp",
                type:"get",
                data:{
                    id:parseInt(id)
                },
                success:function(data){
                    console.log(data)
                    $("input[cb-node='name']").val(data.data.name);
                    //$("select[cb-node='role_id']").val(data.role);
                    $("input[cb-node='user_name']").val(data.data.user_name);


                },
                error:function(){
                    toastr.error('失败啦!');
                }
            })
        },
        //验证
        Verification:function(){
            var that=this;
            var validator = new FormValidator();
            validator.settings.alerts = true;
            $('.btn-save').click(function () {
                var isValid = true;
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    var result = validator.checkField.call(validator, required.eq(i));
                    if (result.valid === false) {
                        isValid = false;
                    }
                }
                if( isValid == true ){
                    that.acquisition();
                }
            });
        },
        acquisition:function(){
            var that=this;
            var data={};
            data.name = $("input[cb-node='name']").val();
            data.role = $("select[cb-node='role_id']").val();
            data.user = $("input[cb-node='user_name']").val();
            data.password = $("input[cb-node='password']").val();
            data.department = $("input[cb-node='department']").val();
            data.post = $("input[cb-node='post']").val();
            data.phone = $("input[cb-node='phone']").val();
            data.telephone= $("input[cb-node='telephone']").val();
            if ((window.location.search.indexOf('?id=') == -1)) {
                alert(1)
            }else{
                alert(2)
            }
            console.log(data);
        },
        addEvent:function(){
            var that=this;

        },
        submitData:function(){

        }
    };
    $(function(){
        main.init();
    })
}());
