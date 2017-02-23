/**
 * Created by lijiahao on 17/1/9.
 */
;(function () {
    var main = {
        init: function () {
            var that = this;
            this.name = '';
            //toastr.options = ({
            //    progressBar: true,
            //    positionClass: "toast-top-center"
            //});
            //toastr.success('Have fun storming the castle!', 'Miracle Max Says');
            //toastr.info('Have fun storming the castle!', 'Miracle Max Says');
            //toastr.error('Have fun storming the castle!', 'Miracle Max Says');
            //toastr.warning('1','2');
            // initialize the validator function
            var validator = new FormValidator();
            validator.settings.alerts = true;
            $('#submit').click(function(){
                for( var i = 0 ; i < $('input[required]').length; i ++ ){
                    var required = $('input[required]');
                    validator.name = required.eq(i).attr('name');
                    validator.checkField.call(validator, required.eq(i))
                }
            });
            this.addEvent();
        },
        addEvent: function () {
            var that = this;

            // 下一步
            $('#nextStep').click(function () {
                var active = $('.add-goods-active');
                $('#content-1').hide();
                $('#content-2').show();
                active.next('span').addClass('add-goods-active');
                active.removeClass('add-goods-active');

            });
        }
    };
    // run
    $(function () {
        main.init();
    })
})();