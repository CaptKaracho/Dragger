
/// <reference path="D:\Entwicklung\Beispiele\Dragger\Dragger\Dragger\Scripts/jquery-3.1.1.min.js" />

var Dragger = (function ($) {

    var dragger = {};

    var events = {
        dropzone: {
            inRange: null
        },
        moveObject: {
            setPosition: null
        }
    };

    dragger.dragClass = "dragable";
    dragger.dropzoneClass = "dropzone";
    dragger.dropzones = [];
    dragger.dropzones_getInrange = function (mouseEvent) {
        var x = mouseEvent.pageX;
        var y = mouseEvent.pageY;

        var ofParent = $(mouseEvent.target)[0].offsetParent;
        var ofX = ofParent.offsetLeft;
        var ofY = ofParent.offsetTop;

        var rangeOffset = 0;

        $.each(this.dropzones, function (key, value) {
            var el = $(value);
            var elPos = el.position();
            if (x > (elPos.left + ofX - rangeOffset) && x < (elPos.left + el.width() + ofX + rangeOffset) && y > (elPos.top + ofY - rangeOffset) && y < (elPos.top + el.height() + ofY + rangeOffset)) {

                $(value).addClass("active");

                events.dropzone.inRange = new CustomEvent("dropzoneInRange", {
                    detail: {
                        dropzone: value
                    }
                });
                document.dispatchEvent(events.dropzone.inRange);
            }
            else
                $(value).removeClass("active");
        });

    };
    dragger.moveObject = {
        element: null,
        mouseOffsetX: 0,
        mouseOffsetY: 0,
        reset: function () {
            this.element = null;
            this.mouseOffsetX = 0;
            this.mouseOffsetY = 0;
        },
        set_position: function (x, y) {
            events.moveObject.setPosition = new CustomEvent("moveObject_setPosition", {
                detail: {
                    el: this.element.id,
                    x: x,
                    y: y
                }
            });

            document.dispatchEvent(events.moveObject.setPosition);

            $(this.element).css({
                transform: 'translate(' + x + 'px, ' + y + 'px)'
            });
        }
    };

    $(document).ready(function () {

        dragger.dropzones = $("." + dragger.dropzoneClass);

        $("." + dragger.dragClass).mousedown(function (e) {
            dragger.moveObject.element = $(this)[0];
            dragger.moveObject.mouseOffsetX = e.offsetX;
            dragger.moveObject.mouseOffsetY = e.offsetY;

            dragger.moveObject.parentOffsetX = $(this).offsetParent()[0].offsetLeft;
            dragger.moveObject.parentOffsetY = $(this).offsetParent()[0].offsetTop;
        });

        $(document).mousemove(function (e) {
            if (dragger.moveObject.element != null) {
                var x = e.pageX - dragger.moveObject.mouseOffsetX - dragger.moveObject.parentOffsetX;
                var y = e.pageY - dragger.moveObject.mouseOffsetY - dragger.moveObject.parentOffsetY;
                dragger.moveObject.set_position(x, y);
                dragger.dropzones_getInrange(e);
            }
        }).mouseup(function (e) {
            if (dragger.moveObject.element != null) {
                dragger.moveObject.reset();
            }
        });
    });

    return dragger;
})(jQuery);