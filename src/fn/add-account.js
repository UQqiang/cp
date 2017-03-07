/**
 * Created by kyn on 17/2/24.
 */
;(function(){
    var main={
        init:function(){
            var that=this;
            that.Verification();
            that.addEvent();
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
            var data={};
            data.name = $("input[cb-node='name']").val();
            data.role = $("select[cb-node='role_id']").val();
            data.user = $("input[cb-node='user_name']").val();
            data.password = $("input[cb-node='password']").val();
            data.department = $("input[cb-node='department']").val();
            data.post = $("input[cb-node='post']").val();
            data.phone = $("input[cb-node='phone']").val();
            data.telephone= $("input[cb-node='telephone']").val();
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
