<script type="text/javascript">
      'use strict';

(function() {


    ol.Overlay.Popup = function(opt_options) {

        var options = opt_options || {};

        this.panMapIfOutOfView = options.panMapIfOutOfView;
        if (this.panMapIfOutOfView === undefined) {
            this.panMapIfOutOfView = true;
        }

        this.ani = options.ani;
        if (this.ani === undefined) {
            this.ani = ol.animation.pan;
        }

        this.ani_opts = options.ani_opts;
        if (this.ani_opts === undefined) {
            this.ani_opts = {'duration': 250};
        }

        this.container = document.createElement('div');
        this.container.className = 'ol-popup';
        this.container.id = (options.hasOwnProperty('id')) ? options.id : '';

        /*
          Disable closer for viewer until the issue of the overlay repeatedly
          opening during playback in resolved

        this.closer = document.createElement('a');
        this.closer.className = 'ol-popup-closer';
        this.closer.href = '#';
        this.container.appendChild(this.closer);

        var that = this;
        this.closer.addEventListener('click', function (evt) {
            that.container.style.display = 'none';
            that.closer.blur();
            evt.preventDefault();
        }, false);
        */

        this.content = document.createElement('div');
        this.content.className = 'ol-popup-content';
        this.container.appendChild(this.content);

        ol.Overlay.call(this, {
            id: (options.hasOwnProperty('id')) ? options.id : 'popup',
            element: this.container,
            positioning: (options.hasOwnProperty('positioning')) ? options.positioning : 'top-left',
            stopEvent: (options.hasOwnProperty('stopEvent')) ? options.stopEvent : true,
            insertFirst: (options.hasOwnProperty('insertFirst')) ? options.insertFirst : true
        });

    };

    ol.inherits(ol.Overlay.Popup, ol.Overlay);

    ol.Overlay.Popup.prototype.getId = function() {
        return this.container.id;
    };

    ol.Overlay.Popup.prototype.show = function(coord, encodedHtml) {
        this.setPosition(coord);
        var html;
        try{
            html = decodeURIComponent(escape(encodedHtml));
        } catch(e) {
            html = encodedHtml;
        }
        if (html instanceof HTMLElement) {
            this.content.innerHTML = "";
            this.content.appendChild(html);
        } else {
            this.content.innerHTML = html;
        }
        this.container.style.display = 'block';
        if (this.panMapIfOutOfView) {
            this.panIntoView_(coord);
        }
        this.content.scrollTop = 0;
        return this;
    };

    /**
     * @private
     */
    ol.Overlay.Popup.prototype.panIntoView_ = function(coord) {

        var popSize = {
                width: this.getElement().clientWidth + 20,
                height: this.getElement().clientHeight + 20
            },
            mapSize = this.getMap().getSize();

        var tailHeight = 20,
            tailOffsetLeft = 60,
            tailOffsetRight = popSize.width - tailOffsetLeft,
            popOffset = this.getOffset(),
            popPx = this.getMap().getPixelFromCoordinate(coord);

        var fromLeft = (popPx[0] - tailOffsetLeft),
            fromRight = mapSize[0] - (popPx[0] + tailOffsetRight);

        var fromTop = popPx[1] - popSize.height + popOffset[1],
            fromBottom = mapSize[1] - (popPx[1] + tailHeight) - popOffset[1];

        var center = this.getMap().getView().getCenter(),
            curPx = this.getMap().getPixelFromCoordinate(center),
            newPx = curPx.slice();

        if (fromRight < 0) {
            newPx[0] -= fromRight;
        } else if (fromLeft < 0) {
            newPx[0] += fromLeft;
        }

        if (fromTop < 0) {
            newPx[1] += fromTop;
        } else if (fromBottom < 0) {
            newPx[1] -= fromBottom;
        }

        if (this.ani && this.ani_opts) {
            this.ani_opts.source = center;
            this.getMap().beforeRender(this.ani(this.ani_opts));
        }

        if (newPx[0] !== curPx[0] || newPx[1] !== curPx[1]) {
            this.getMap().getView().setCenter(this.getMap().getCoordinateFromPixel(newPx));
        }

        return this.getMap().getView().getCenter();

    };

    /**
     * Hide the popup.
     */
    ol.Overlay.Popup.prototype.hide = function() {
        this.container.style.display = 'none';
        return this;
    };


    /**
     * Indicates if the popup is in open state
     */
    ol.Overlay.Popup.prototype.isOpened = function() {
        return this.container.style.display == 'block';
    };
})();
</script>