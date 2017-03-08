/**
 * Created by kyn on 17/3/8.
 */
;(function(){
    var main={
        init:function(){
            this.api = Api.domain();
            this.render();
            this.addEvent();
        },
        render:function(){
            var that = this;
            $.ajax({
                url:that.api + "/bossmanager/freight/queryAreas.do",
                dataType:"jsonp",
                type:"get",
                success:function(data){
                    console.log(data)
                },
                error:function(){
                    alert(2)
                }
            })
        },
        addEvent:function(){
            var that = this;
            //添加地区渲染
            $('.J_addTpl').click(function(){
                var data={
                    place:"未添加地区"
                };
                that.renderBorder(data);
            });
            // 添加地区 表格删除
            $("body").on("click",".J_del",function(){
                $(this).parents(".odd").remove();
            });
            $("body").on("click",".city-choose",function(){
                $(".fade").show();
                $(".modal-lg").fadeIn(500)
            });
            //计价方式
            $('.pricing_method input[name=radio]').click(function(){
                if( $(this).val() == 0 ) {
                    $('.unit').text('件');
                    $('.unit-che').text('件')
                } else if ( $(this).val() == 2 ) {
                    $('.unit').text('m³');
                    $('.unit-che').text('体积')
                } else {
                    $('.unit').text('kg');
                    $('.unit-che').text('重')
                }
            });
            $('.close').click(function(){
                $(".btn-default").click();
            })
            $(".btn-default").click(function(){
                $(".fade").hide();
                $('.modal-lg').fadeOut(500);

            })

            //批量操作
            $('.batch-ope').click(function(e){
                $checkbox =  $('.tpl-set .ui-table .checkItem');
                e.preventDefault();
                if($(this).html() == '取消批量'){
                    $('.the-batch').css({'display':'none'});
                    $(this).html('批量操作')
                }else{
                    $('.the-batch').css({'display':'block'});
                    $(this).html('取消批量');
                }
                if( !$checkbox.hasClass('checkShow') ){
                    $checkbox.css({'display':'inline-block'});
                    $checkbox.addClass('checkShow');
                }else{
                    $checkbox.css({'display':'none'});
                    $checkbox.removeClass('checkShow');
                    if( $checkbox.attr('checked','checked') ){
                        $checkbox.removeAttr('checked','checked')
                    }
                }
                that.isCheckAll();
            });
            //批量设置
            $("body").on('click','.batch-setting',function(e){
                e.preventDefault();
                $(".fade").show();
                $(".modal-lg").fadeIn(500)
            })
        },
        isCheckAll: function(){
            var the_num = $('.checkItem:checked').length;
            if (the_num == $('.checkItem').length) {
                $(".checkAll").prop('checked', true);
            } else {
                $(".checkAll").prop('checked', false);
            }
        },
        renderBorder:function(data){
            var $tpl=$("#tpl").html();
            $(".J_tpl_list").append(_.template($tpl)({
                data:data
            }));
        }
    }
    $(function(){
        main.init();
    })
}());
