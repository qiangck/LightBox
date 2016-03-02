;(function($){
    var LightBox =function(setting){
        var _this =this;
        // 默认配置项
        this.settings = {
            speed:500
        };
        $.extend(this.settings,setting || {});
        // 创建遮罩和弹出框
        this.popupMask = $('<div id="G-lightbox-mask">');
        this.popupWin = $('<div id="G-lightbox-popup">');
        // 保存Body
        this.bodyNode = $(document.body);
        // 渲染剩余的DOM,并且插入到Body
        this.renderDOM();
        
        this.picView = this.popupWin.find('div.lightbox-pic-view');// 图片预览区域
        this.popupPic = this.popupWin.find('img.lightbox-image');// 图片区域
        this.picCaptionArea = this.popupWin.find('div.lightbox-pic-caption'); // 图片标题区域
        this.nextBtn = this.popupWin.find('span.lightbox-next-btn');// 左右按钮
        this.prevBtn = this.popupWin.find('span.lightbox-prev-btn');// 左右按钮
        this.CaptionText = this.popupWin.find('p.lightbox-pic-desc');//描述区域
        this.currentIndex = this.popupWin.find('span.lightbox-of-index');//索引区域
        this.closeBtn = this.popupWin.find('span.lightbox-close-btn');//关闭按钮

        // 开发开始，事件委托，获取组数据
        this.groupName = null;
        // 放置同一组数据
        this.groupData = [];
        this.bodyNode.delegate(".js-lightbox,*[data-role=lightbox]", "click", function(event) {
            // 阻止事件冒泡
            event.stopPropagation();
            var currentGroupName = $(this).attr("data-group");
            // 判断是否为同一组的数据
            if(currentGroupName != _this.groupName){
                _this.groupName = currentGroupName;
                // 根据当前组名获取同一组数据
                _this.getGroup();
            };
            _this.initPopup($(this));
        });
        // 关闭弹出
        this.popupMask.click(function(){
            $(this).fadeOut();
            _this.popupWin.fadeOut();
            _this.clear = false;
        });
        this.closeBtn.click(function(){
            _this.popupMask.fadeOut();
            _this.popupWin.fadeOut();
            _this.clear = false;
        });
        // 绑定上下切换按钮事件
        this.flag = true;
        this.nextBtn.hover(function(){
            if(!$(this).hasClass("disabled")&&_this.groupData.length>1){
                $(this).addClass("lightbox-next-btn-show");
            };
        },function(){
            if(!$(this).hasClass("disabled")&&_this.groupData.length>1){
                $(this).removeClass("lightbox-next-btn-show");
            };
        }).click(function(e){
            if(!$(this).hasClass('disabled')&&_this.flag){
                _this.flag = false;
                e.stopPropagation();
                _this.goto("next");
            }
        });
        this.prevBtn.hover(function(){
            if(!$(this).hasClass("disabled")&&_this.groupData.length>1){
                $(this).addClass("lightbox-prev-btn-show");
            };
        },function(){
            if(!$(this).hasClass("disabled")&&_this.groupData.length>1){
                $(this).removeClass("lightbox-prev-btn-show");
            };
        }).click(function(e){
            if(!$(this).hasClass('disabled')&&_this.flag){
                _this.flag = false;
                e.stopPropagation();
                _this.goto("prev");
            }
        });
        // 判断是否为IE6
        this.isIE6 = /MSIE 6.0/gi.test(window.navigator.userAgent);
        // 绑定窗口调整事件
        var timer = null;
        this.clear = false;
        $(window).resize(function(event) {
            if(_this.clear){
                window.clearTimeout(timer);
                timer = window.setTimeout(function(){
                    _this.loadPicSize(_this.groupData[_this.index].src);
                },500);
                if(_this.isIE6){
                    _this.popupMask,css({
                        width:$(window).width(),
                        height:$(window).height()
                    });
                };
            }
        }).keyup(function(event) {
            // 输出键盘输入的键值
            // console.log(event.which)
            var keyValue = event.which;
            if(_this.clear){
                if(keyValue == 38 || keyValue == 37){
                    _this.prevBtn.click();
                }else if(keyValue == 39 || keyValue == 40){
                    _this.nextBtn.click();
                };
            };
        });
        // 如果是ie6
        if(this.isIE6){
            $(window).scroll(function(){
                _this.popupMask.css({
                    top:$(window).scrollTop()
                });
            });
        };
    };
    LightBox.prototype = {
        goto:function(dir){
            if(dir === "next"){
                this.index ++;
                if(this.index >= this.groupData.length-1){
                    this.nextBtn.addClass('disabled').removeClass('lightbox-next-btn-show');
                };
                if(this.index != 0){
                    this.prevBtn.removeClass('disabled');
                };
                var src = this.groupData[this.index].src;
                this.loadPicSize(src);

            }else if(dir === "prev"){
                this.index -- ;
                if(this.index <= 0){
                    this.prevBtn.addClass('disabled').removeClass('lightbox-prev-btn-show');
                };
                if(this.index != this.groupData.length -1){
                    this.nextBtn.removeClass('disabled');
                }
                var src = this.groupData[this.index].src;
                this.loadPicSize(src);
            }
        },
        loadPicSize:function(sourceSrc){
            var _this = this;
            _this.popupPic.css({
                width:"auto",
                height:"auto"
            }).hide();
            this.picCaptionArea.hide();
            this.preLoadImg(sourceSrc,function(){
                _this.popupPic.attr("src",sourceSrc);
                var picWidth = _this.popupPic.width(),
                    picHeight = _this.popupPic.height();
                _this.changePic(picWidth,picHeight);
            });
        },
        changePic:function(width,height){
            var _this = this,
                winWidth = $(window).width(),
                winHeight = $(window).height();
            // 如果图片的宽高大于浏览器视口的比例，判断是否溢出
            var scale = Math.min(winWidth/(width+10),winHeight/(height+10),1);
            width = width * scale,
            height = height * scale;

            this.picView.animate({
                width:width-10,
                height:height-10
            },_this.settings.speed);

            var top = (winHeight-height)/2;
            if(this.isIE6){
                top += $(window).scrollTop();
            }
            this.popupWin.animate({
                width:width,
                height:height,
                marginLeft:-(width/2),
                top:top
            },_this.settings.speed,function(){
                _this.popupPic.css({
                    width:width-10,
                    height:height-10,
                }).fadeIn();
                _this.picCaptionArea.fadeIn();
                _this.flag = true;
                _this.clear = true;
            });
            // 设置描述文字和当前索引
            this.CaptionText.text(this.groupData[this.index].caption);
            this.currentIndex.text("当前索引： "+ (this.index+1)+" "+"of "+this.groupData.length);
        },
        preLoadImg:function(sourceSrc,callback){
            var img = new Image();
            if(!!window.ActiveXObject){
                img.onreadystatechange = function(){
                    if(this.readyState == "complete"){
                        callback();
                    };
                };
            }else{
                img.onload = function(){
                    callback();
                }
            };
            img.src = sourceSrc;
        },
        showMaskAndPopup:function(sourceSrc,currentId){
            var _this = this;
            this.popupPic.hide();
            this.picCaptionArea.hide();
            var winWidth = $(window).width(),
                winHeight = $(window).height();
            this.picView.css({
                width:winWidth/2,
                height:winHeight/2
            });
            // 兼容ie6
            if(this.isIE6){
                var scrollTop = $(window).scrollTop();
                this.popupMask.css({
                    width:winWidth,
                    height:winHeight,
                    top:scrollTop
                })
            };
            this.popupMask.fadeIn();
            this.popupWin.fadeIn();
            var viewHeight = winHeight/2 + 10;
            var topAnimate = (winHeight - viewHeight)/2;
            this.popupWin.css({
                width:winWidth/2 + 10,
                height:winHeight/2 +10,
                marginLeft:-(winWidth/2 + 10)/2,
                top:(this.isIE6 ? -(viewHeight + scrollTop) :-viewHeight)
            }).animate({
                top:(this.isIE6 ? topAnimate + scrollTop : scrollTop)
            },_this.settings.speed,function(){
                // 加载图片
                _this.loadPicSize(sourceSrc);
            });
            // 根据当前点击的元素id获取在当前组里的索引
            this.index = this.getIndexOf(currentId);
            // console.log(this.index);
            var groupDataLength = this.groupData.length;
            if(this.groupData.length>1){
                if(this.index === 0){
                    this.prevBtn.addClass("disabled");
                    this.nextBtn.removeClass("disabled");
                }else if(this.index === groupDataLength-1){
                    this.prevBtn.removeClass("disabled");
                    this.nextBtn.addClass("disabled");
                }else{
                    this.prevBtn.removeClass("disabled");
                    this.nextBtn.removeClass("disabled");
                }
            }else{
                this.prevBtn.addClass("disabled");
                this.nextBtn.addClass("disabled");
            }

        },
        getIndexOf:function(currentId){
            var index = 0;
            $(this.groupData).each(function(e){
                index = e;
                if(this.id === currentId){
                    return false;
                };
            });
            return index;
        },
        initPopup:function(currentObj){
            var _this = this,
                sourceSrc = currentObj.attr("data-source"),
                currentId = currentObj.attr("data-id");
            this.showMaskAndPopup(sourceSrc,currentId);

        },
        getGroup:function(){
            var _this = this;
            // 根据当前的组别名称获取页面中所有相同组别的对象
            var groupList = this.bodyNode.find("*[data-group="+this.groupName+"]");
            // 清空数组数据
            _this.groupData.length = 0;
            groupList.each(function(index, even) {
                _this.groupData.push({
                    src:$(this).attr("data-source"),
                    id:$(this).attr("data-id"),
                    caption:$(this).attr("data-caption")
                });
            });
            // console.log(_this.groupData)
            
        },
        renderDOM:function(){
            var strDOM ="<div class='lightbox-pic-view'>"
                         +"<span class='lightbox-btn lightbox-prev-btn'></span>"
                         +"<img src='pic/1.jpg' class='lightbox-image'>"
                         +"<span class='lightbox-btn lightbox-next-btn'></span>"
                         +"</div>"
                         +"<div class='lightbox-pic-caption'>"
                         +"<div class='lightbox-caption-area'>"
                         +"<p class='lightbox-pic-desc'>1411</p>"
                         +"<span class='lightbox-of-index'>当前索引：1 of 4</span>"
                         +"</div>"
                         +"<span class='lightbox-close-btn'>X</span>"
                         +"</div>";
            // 插入到this.popupWin
            this.popupWin.html(strDOM);
            // 把遮罩和弹出框插入到body
            this.bodyNode.append(this.popupMask,this.popupWin);
        }
    };
    window["LightBox"] = LightBox;
})(jQuery);