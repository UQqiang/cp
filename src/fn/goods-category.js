/**
 * Created by lijiahao on 17/1/9.
 */
;(function () {
    var main = {
        init: function () {
            this.currentCateObj = {};                   // 当前选择的一二级类目对象
            this.categoryId = '';
            this.imageUrl = '';
            this.api = Api.domain();                    // 接口请求的api
            // 初始化提示框
            toastr.options = ({
                progressBar: true,
                positionClass: "toast-top-center"
            });
            var height = window.innerHeight - 200;
            $('.category-list').css({
                'min-height': height + 'px'
            });
            this.addEvent();
            this.imgModal();
            this.queryCategory();
        },
        /**
         * 调用图片选择插件
         */
        imgModal: function () {
            var that = this;
            $('.imgUploadBtn').imgModal({
                selectImgPopupBtn: '.imgUploadBtn',
                selectImgBtn: '.j-select-img',
                times: 1,
                multiple: false,
                selectSuccess: function (data, target) {
                    that.$currentImgUploadBtn = target;
                    that.imgSelected(data);
                },
                uploadSuccess: function (data, target) {
                    that.$currentImgUploadBtn = target;
                    that.imgSelected(data[0].url);
                }
            });
        },
        imgSelected: function (url) {
            console.log(url);
            this.imageUrl = url;
            if( this.$currentImgUploadBtn.find('.icon-image').length > 0 ){
                this.$currentImgUploadBtn.find('.icon-image').attr('src',url);
            }else{
                this.$currentImgUploadBtn.append('<img class="icon-image" src="'+url+'">')
            }
        },
        addEvent: function () {
            var that = this;

            $('.categories').on('click', '.j-add-category', function () {
                // remove 之前的tip
                if( that.dialogTip ){
                    that.dialogTip.close();
                }
                var type = $(this).attr('data-type');
                var data = {};
                var d = {};
                if (type == 1) {
                    data.content = '<div class="add-category-dialog"><input class="form-control form-control-lg j-category-name" placeholder="请输入类目名称"></div>';
                    data.closeOnBodyClick = true;
                    d.parent_id = 0;
                } else if (type == 2) {
                    if( !that.categoryId ){
                        toastr.error('请选择一级类目','提示');
                        return false;
                    }
                    data.content = '<div class="add-category-dialog"><a class="imgUploadBtn"><i class="fa fa-plus"></i></a><input class="form-control form-control-lg j-category-name" placeholder="请输入类目名称"></div>';
                    data.closeOnBodyClick = false;
                    d.parent_id = that.categoryId;
                }
                data.target = $(this);
                data.width = 400;
                data.position = 'top';
                that.tip(data, function (btn, dialog) {
                    d.category_name = $.trim($('.j-category-name').val());
                    if( that.imageUrl ){
                        d.image_url = that.imageUrl;
                    }
                    that.addCategory(d, function (cbData) {
                        if( cbData.code == 10000 ){
                            toastr.success('添加分类成功','提示');
                            that.queryCategory(type);
                            that.imageUrl = '';
                        }else{
                            toastr.error(cbData.msg,'提示');
                        }
                    }, function (cbData) {
                        toastr.error(cbData.msg,'提示');
                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });

                //that.queryCategory();
            });

            $('.categories').on('click', '.j-edit-category', function () {
                // remove 之前的tip
                if( that.dialogTip ){
                    that.dialogTip.close();
                }
                var id = $(this).parents('li').attr('data-id');
                var name = $(this).parents('li').attr('data-name');
                var type = $(this).parents('li').attr('data-cate_level');
                var img = $(this).parents('li').attr('data-img');
                var data = {};
                var d = {};
                data.content = '确定要删除该类目:&nbsp;' + name + '吗?';
                data.target = $(this);
                d.category_id = id;
                if (type == 1) {
                    data.closeOnBodyClick = true;
                    data.width = 250;
                    data.content = '<div class="add-category-dialog"><input class="form-control form-control-lg j-category-name" placeholder="请输入类目名称" value="'+name+'"></div>';
                    d.parent_id = 0;
                } else if (type == 2) {
                    data.closeOnBodyClick = false;
                    data.width = 400;
                    if( img ){
                        that.imageUrl = img;
                        data.content = '<div class="add-category-dialog"><a class="imgUploadBtn"><i class="fa fa-plus"></i><img class="icon-image" src="'+img+'"></a><input class="form-control form-control-lg j-category-name" placeholder="请输入类目名称" value="'+name+'"></div>';
                    }else{
                        data.content = '<div class="add-category-dialog"><a class="imgUploadBtn"><i class="fa fa-plus"></i></a><input class="form-control form-control-lg j-category-name" placeholder="请输入类目名称" value="'+name+'"></div>';
                    }
                    d.parent_id = that.categoryId;
                }
                that.tip(data, function (btn, dialog) {
                    d.category_name = $.trim($('.j-category-name').val());
                    if( that.imageUrl ){
                        d.image_url = that.imageUrl;
                    }
                    that.updateCategory(d, function (cbData) {
                        if( cbData.code == 10000 ){
                            toastr.success('编辑分类:&nbsp;"'+name+'"&nbsp;为&nbsp;"'+d.category_name+'"&nbsp;成功','提示');
                            that.queryCategory(type);
                            that.imageUrl = '';
                        }else{
                            toastr.error(cbData.msg,'提示');
                        }
                    }, function (cbData) {
                        toastr.error(cbData.msg,'提示');
                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            $('.categories').on('click', '.j-delete-category', function () {
                // remove 之前的tip
                if( that.dialogTip ){
                    that.dialogTip.close();
                }
                var id = $(this).parents('li').attr('data-id');
                var name = $(this).parents('li').attr('data-name');
                var cateLevel = $(this).parents('li').attr('data-cate_level');
                var data = {};
                data.content = '确定要删除该类目:&nbsp;' + name + '吗?';
                data.target = $(this);
                data.closeOnBodyClick = true;
                that.tip(data, function (btn, dialog) {
                    that.deleteCategory(id, function (d) {
                        toastr.success('删除成功', '提示');
                        if (cateLevel == 2) {
                            data.target.parents('li').remove();
                        }
                        that.queryCategory(cateLevel);
                    }, function (d) {
                        toastr.error(d.msg || d, '提示');
                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            })
        },
        /**
         * tip
         * @param data
         * @param success
         * @param fail
         */
        tip: function (data, success, fail) {
            this.dialogTip = jDialog.tip(data.content, {
                target: data.target,
                position: data.position || 'left'
            }, {
                width: data.width || 200,
                closeable: false,
                closeOnBodyClick: data.closeOnBodyClick,
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
        /**
         * 获取类目
         */
        queryCategory: function (cateLevel) {
            var that = this;
            $.ajax({
                url: that.api + '/category/leaf/query.do',
                type: 'get',
                dataType: 'jsonp',
                data: {},
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    //that.categoryData = data.data;
                    if (data.code === 10000) {
                        var template = _.template($('#template-category').html());

                        // 渲染一级类目
                        $('#add-goods-category-1').html(template({
                            items: data.data
                        }));

                        if (cateLevel == 1) {
                            $('#add-goods-category-2').html('');
                        }

                        if( that.categoryId ){
                            $('#add-goods-category-1').find('li[data-id='+ that.categoryId +']').click();
                        }

                        // 类目的点击事件
                        $('.categories').on('click', '.category-list li', function () {
                            var id = $(this).attr('data-id');
                            var parent_id = $(this).attr('data-parent_id');
                            var name = $.trim($(this).text());
                            var level = $(this).attr('data-cate_level');
                            if ($(this).attr('data-sub_cate') != 'undefined') {
                                var subCate = JSON.parse(decodeURIComponent($(this).attr('data-sub_cate')));
                            }
                            console.log(subCate);

                            if (parent_id == 0) {
                                // 点击的是一级类目
                                // 一级类目移除active
                                that.categoryId = id;
                                $('.category-list li[data-parent_id=' + parent_id + ']').removeClass('active');
                                $('#add-goods-category-2').html(template({
                                    items: subCate
                                }));
                                that.currentCateObj = {};

                            } else {
                                // 点击的是二级类目
                                that.categoryId = parent_id;
                                $('.category-list li[data-parent_id!=0]').removeClass('active');
                            }

                            that.currentCateObj[level] = {
                                id: id,
                                parent_id: parent_id,
                                name: name,
                                level: level
                            };
                            $('.category-list li[data-parent_id=' + parent_id + ']').find('.edit-category,.delete-category').hide();
                            $(this).find('.edit-category,.delete-category').show();
                            $(this).addClass('active');
                            console.log('that.currentCateObj :' + JSON.stringify(that.currentCateObj));
                            console.log('类目id:' + that.categoryId);
                        });
                    }
                },
                complete: function () {
                },
                error: function (data) {

                }
            })
        },
        /**
         * 删除类目
         */
        deleteCategory: function (id, success, error) {
            var that = this;
            $.ajax({
                url: that.api + '/category/delete.do',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    category_id: id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        success && success(data);
                    } else {
                        error && error(data);
                    }
                },
                complete: function () {

                },
                error: function (data,msg) {
                    console.log(data,msg);
                    error && error(data);
                }
            });
        },
        /**
         * 添加
         */
        addCategory: function (data, success, error) {
            var that = this;
            $.ajax({
                url: that.api + '/category/add.do',
                type: 'get',
                dataType: 'jsonp',
                data: data,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        success && success(data);
                    } else {
                        error && error(data);
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    error && error(data);
                }
            });
        },
        /**
         * 编辑
         */
        updateCategory: function (data, success, error) {
            var that = this;
            $.ajax({
                url: that.api + '/category/update.do',
                type: 'get',
                dataType: 'jsonp',
                data: data,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        success && success(data);
                    } else {
                        error && error(data);
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    error && error(data);
                }
            });
        }
    };
    // run
    $(function () {
        main.init();
    })
})();