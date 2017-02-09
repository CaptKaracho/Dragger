
/// <reference path="D:\Entwicklung\Beispiele\Dragger\Dragger\Dragger\Scripts/jquery-3.1.1.min.js" />

var Dragger = (function ($) {
    var dragger = {};

    var events = {
        dropzone: {
            inRange: null,
            moveDrop: null
        },
        erasezone: {
            inRange: null,
            moveDrop: null
        },
        moveObject: {
            dropOnDropzone: null,
            setPosition: null
        }
    };

    var idGenerator = function () {
        return Math.random().toString(36).substr(2, 9);
    };

    dragger.settings = {
        dragSource: {
            className: 'dragsource'
        },
        dragable: {
            dragStackId: 'dragableStack',
            className: 'dragable'
        },
        dropzone: {
            className: 'dropzone'
        },
        erasezone: {
            className: 'erasezone'
        },
        moveObject: {
            fitToDropzone: false
        }
    };

    dragger.activeZone = null;

    dragger.dragsources = [];
    dragger.dropzones = [];
    dragger.erasezones = [];
    dragger.elements = [];

    dragger.zones = function () { return this.dropzones.concat(this.erasezones); };

    dragger.set_activeZone = function (mouseEvent) {
        var x = mouseEvent.pageX;
        var y = mouseEvent.pageY;

        var ofParent = $(mouseEvent.target)[0].offsetParent;

        var ofX = 0;
        var ofY = 0;
        if (ofParent !== null) {
            ofX = ofParent.offsetLeft;
            ofY = ofParent.offsetTop;
        }

        var rangeOffset = 0;
        var ret = undefined;
        var hits = 0;
        $.each(this.zones(), function (key, value) {
            var el = $(value);
            var elPos = el.position();
            if (x > (elPos.left + ofX - rangeOffset) && x < (elPos.left + el.width() + ofX + rangeOffset) && y > (elPos.top + ofY - rangeOffset) && y < (elPos.top + el.height() + ofY + rangeOffset)) {

                $(value).addClass("active");

                if ($(value).hasClass(dragger.settings.erasezone.className)) {
                    //console.dir("erase");

                    events.erasezone.inRange = new CustomEvent("inRange_erasezone", {
                        detail: {
                            erasezone: value
                        }
                    });
                    document.dispatchEvent(events.erasezone.inRange);
                }
                if ($(value).hasClass(dragger.settings.dropzone.className)) {
                    //console.dir("dropzone");

                    events.dropzone.inRange = new CustomEvent("inRange_dropzone", {
                        detail: {
                            dropzone: value
                        }
                    });
                    document.dispatchEvent(events.dropzone.inRange);

                }
                ret = value;
                dragger.activeZone = ret;
                hits++;
            }
            else
                $(value).removeClass("active");
        });
        if (hits === 0) {
            dragger.activeZone = null;
            $(dragger.zones()).removeClass("active");
        }

        return ret;
    };
    dragger.moveObject = undefined;
    //TODO:class

    function MoveElement() {
        this.id = 0;
        this.element = undefined;
        this.sourceDataset = undefined;
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
        this.parentOffsetX = 0;
        this.parentOffsetY = 0;
        this.reset = function () {
            //delete this.element = null;
            // this.mouseOffsetX = 0;
            // this.mouseOffsetY = 0;
            // this.sourceDataset = null;
        };
        this.set_position = function (x, y) {
            events.moveObject.setPosition = new CustomEvent("moveObject_setPosition", {
                detail: {
                    el: this.id,
                    x: x,
                    y: y
                }
            });

            document.dispatchEvent(events.moveObject.setPosition);

            $(this.element).css({
                transform: 'translate(' + x + 'px, ' + y + 'px)'
            });
        };
    };

    dragger.init = function () {
        dragger.dropzones = [].slice.call(document.getElementsByClassName(dragger.settings.dropzone.className));
        dragger.dragsources = [].slice.call(document.getElementsByClassName(dragger.settings.dragSource.className));
        dragger.erasezones = [].slice.call(document.getElementsByClassName(dragger.settings.erasezone.className));
        [].slice.call(document.getElementsByClassName(dragger.settings.dragable.className)).forEach(f => {
            var el = new MoveElement();
            el.element = f;
            el.id = f.id;
            el.sourceDataset = f.dataset;
            dragger.elements.push(el);
        });

        $(document).on("mousedown", "." + dragger.settings.dragSource.className, function (e) {
            let $this = $(e.currentTarget);

            //REDESIGN!
            let id = idGenerator();

            //TODO: use Templates
            var dragEl = "<div id='" + id + "' class='" + dragger.settings.dragable.className + "'>" + $this[0].dataset.description
                + "</div>";

            $("#" + dragger.settings.dragable.dragStackId).prepend(dragEl);

            var el = new MoveElement();
            el.id = id;
            el.element = $("#" + id)[0];
            el.sourceDataset = $this[0].dataset;
            el.mouseOffsetX = e.offsetX;
            el.mouseOffsetY = e.offsetY;

            dragger.moveObject = el;
            dragger.elements.push(dragger.moveObject);


            dragger.moveObject.parentOffsetX = $(dragger.moveObject.element).offsetParent()[0].offsetLeft;
            dragger.moveObject.parentOffsetY = $(dragger.moveObject.element).offsetParent()[0].offsetTop;

            var x = e.pageX - dragger.moveObject.mouseOffsetX - dragger.moveObject.parentOffsetX;
            var y = e.pageY - dragger.moveObject.mouseOffsetY - dragger.moveObject.parentOffsetY;

            dragger.moveObject.set_position(x, y);
        });

        $(document).on("mousedown", "." + dragger.settings.dragable.className, function (e) {

            dragger.moveObject = dragger.elements.find(e => e.id == $(this)[0].id);

            dragger.moveObject.mouseOffsetX = e.offsetX;
            dragger.moveObject.mouseOffsetY = e.offsetY;

            dragger.moveObject.parentOffsetX = $(this).offsetParent()[0].offsetLeft;
            dragger.moveObject.parentOffsetY = $(this).offsetParent()[0].offsetTop;
        });

        $(document).on("mousemove", function (e) {
            if (dragger.moveObject !== undefined ) {
                var x = e.pageX - dragger.moveObject.mouseOffsetX - dragger.moveObject.parentOffsetX;
                var y = e.pageY - dragger.moveObject.mouseOffsetY - dragger.moveObject.parentOffsetY;

                dragger.moveObject.set_position(x, y);
                dragger.set_activeZone(e);
            }
        });

        $(document).on("mouseup", function (e) {
            if (dragger.moveObject !== undefined ) {
                var zone = dragger.activeZone;
                if (zone != undefined) {
                    if (zone.classList.contains(dragger.settings.dropzone.className)) {
                        events.dropzone.moveDrop = new CustomEvent("moveDrop_dropzone", {
                            detail: {
                                dropzone: zone,
                                moveElement: dragger.elements.find(f => f.id == dragger.moveObject.id)
                            }
                        });

                        document.dispatchEvent(events.dropzone.moveDrop);
                    }
                    if (zone.classList.contains(dragger.settings.erasezone.className)) {
                        events.erasezone.moveDrop = new CustomEvent("moveDrop_erasezone", {
                            detail: {
                                erasezone: zone,
                                moveElement: dragger.elements.find(e => e.id == dragger.moveObject.id)
                            }
                        });

                        document.dispatchEvent(events.erasezone.moveDrop);
                    }
                }
                dragger.moveObject = undefined;
            }
        });

        $(document).on("inRange_dropzone", function (event) {

            if (dragger.moveObject.element != null) {

                var dropzone = event.detail.dropzone;

            }
        });

        $(document).on("inRange_erasezone", function (event) {
            if (dragger.moveObject.element !== null) {
                //dragger.moveObject.element.append("erase");
            }
        });

        $(document).on("moveDrop_dropzone", function (event) {
            var zone = event.detail.dropzone;
            if (dragger.settings.moveObject.fitToDropzone)
                dragger.moveObject.set_position(zone.offsetLeft, zone.offsetTop);

            //console.dir(event.detail);
        });

        $(document).on("moveDrop_erasezone", function (event) {
            $(dragger.moveObject.element).remove();
            $(dragger.erasezones).removeClass("active");

            

        });
    };

    return {
        initialize: dragger.init,
        settings: dragger.settings,
        events: event

    };
})(jQuery);