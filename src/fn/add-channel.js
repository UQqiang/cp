/**
 * Created by hzmk on 17/3/3.
 */
;(function(){
    var main={
        init:function(){
            var that=this;
            that.Verification();
        },
        Verification:function(){
            var validator = new FormValidator();
            validator.settings.alerts = true;
            $('.btn-save').click(function () {
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    validator.checkField.call(validator, required.eq(i))
                }
            });
        }
    };
    $(function(){
        main.init()
    })
}());
