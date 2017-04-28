/**
 * Created by kyn on 17/3/21.
 */
;(function(){
    var main= {
        init:function(){
            this.api = Api.domain();
            this.verification();
        },
        verification:function(){
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
                    that.submit();
                }
            });
        },

        submit:function(){
            var that =this;
            var data = {}
            data.name = $("input[cb-node='name']").val();
            data.taxRate= $("input[cb-node='taxRate']").val();
            data.post = $("input[cb-node='post']").val();
            data.tax = $("input[cb-node='tax']").val();
            that.submitData(data)
        },
        submitData:function(data){
            $.ajax({
                url:"",
                type:"",
                dataType:"",
                data:data,
                success:function(data){
                    toastr.success('成功','成功提示');
                },
                error:function(data){
                    toastr.error('失败','错误提示');
                }
            })
        }
    }
    $(function(){
        main.init();
    })
})()