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
        this.popupArea = $('<div id="lightbox-caption-area">');
        
        // 保存Body
        this.bodyNode = $(document.body);
        // 渲染剩余的DOM,并且插入到Body
        this.renderDOM();
        this.popupWinTouch = document.getElementById("G-lightbox-popup");
        this.picView = this.popupWin.find('div.lightbox-pic-view');// 图片预览区域
        this.popupPic = this.popupWin.find('img.lightbox-image');// 图片区域
        this.closeBtn = $('.lightbox-close-btn');//关闭按钮
        this.popupWinTouch.addEventListener('touchstart', function(e){ return _this.start(e); } ,false);//滑动事件
        this.popupWinTouch.addEventListener('touchmove', function(e){ return _this.move(e);  } ,false);//滑动事件
        this.popupWinTouch.addEventListener('touchend', function(e){ return _this.end(e); } ,false);//滑动事件

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
            _this.popupArea.fadeOut();
            _this.popupWin.fadeOut();
            _this.clear = false;
        });

        this.popupArea.on('click',this.closeBtn,function(){
            _this.popupMask.fadeOut();
            _this.popupArea.fadeOut();
            _this.popupWin.fadeOut();
            _this.clear = false;
        });

        // 绑定上下切换按钮事件
        this.flag = true;
        // 滑动事件坐标
        this.sPos = {};
        this.mPos = {};
        this.control = false;
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
        start:function(e){
            var point = e.touches ? e.touches[0] : e;
            this.sPos.x = point.screenX;
            this.sPos.y = point.screenY;
        },
        move:function(e){
            var point = e.touches ? e.touches[0] : e;
            this.control = true;
            this.mPos.x = point.screenX;
            this.mPos.y = point.screenY;
        },
        end:function(e){
            var _this = this;
            !this.control ? this.dire = 'click' : this.mPos.x > this.sPos.x ? this.dire = 'R' : this.dire = 'L';
            this.control = false;
            // 停止事件的传播
            e.stopPropagation();
            if(this.dire === 'R' && this.flag){
                if(this.index>=1){
                    this.popupArea.find('li[data-value]').each(function(index, el) {
                        if($(el).attr('data-value')==_this.index){
                            $(this).removeClass('hover');
                        }else if($(el).attr('data-value')==_this.index - 1){
                            $(this).addClass('hover');
                        }
                    });
                    this.goto("prev");
                    this.flag = false;
                }
            }else if(this.dire === 'L' && this.flag){
                if(this.index<this.groupData.length-1){
                    this.popupArea.find('li[data-value]').each(function(index, el) {
                        if($(el).attr('data-value')==_this.index){
                            $(this).removeClass('hover');
                        }else if($(el).attr('data-value')==_this.index + 1){
                            $(this).addClass('hover');
                        }
                    });
                    this.goto("next");
                    this.flag = false;
                }
            }else if(this.dire === 'click' && this.flag){
                //点击图片触发的事件
                _this.picView.css({
                    width:"100%",
                    height:"100%"
                });
            }
        },
        goto:function(dir){
            if(dir === "next"){
                this.index ++;
                var src = this.groupData[this.index].src;
                this.loadPicSize(src);

            }else if(dir === "prev"){
                this.index -- ;
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
                _this.flag = true;
                _this.clear = true;
            });
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
            this.popupArea.fadeIn();
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
            var groupDataLength = this.groupData.length;
            // 创建小圆点事件
            var strAreaList = '',
                strAreaList2 = '',
                strArea = [];
            for(var i = 0; i < groupDataLength;i++){
                if(i==this.index){
                    strArea[i] = "<li class='hover' data-value='"+i+"'></li>";
                }else{
                    strArea[i] = "<li data-value='"+i+"'></li>";
                }
            }
            var strAreas = "<ul>"+strArea.join("")+"</ul><span class='lightbox-close-btn'>X</span>"
            this.popupArea.html(strAreas);
            this.bodyNode.append(this.popupArea);
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
        },
        renderDOM:function(){
            var strDOM ="<div class='lightbox-pic-view'>\
                            <img src='pic/1.jpg' class='lightbox-image'>\
                        </div>";
            // 插入到this.popupWin
            this.popupWin.html(strDOM);
            // 把遮罩和弹出框插入到body
            this.bodyNode.append(this.popupMask,this.popupWin);
        }
    };
    window["LightBox"] = LightBox;
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);// 禁止微信touchmove冲突
})(jQuery);