/* ========================================================================
 * Bootstrap: tooltip.js v3.0.2
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay
      , hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.'+ this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.$element.trigger('shown.bs.' + this.type)
    }
  }

  Tooltip.prototype.applyPlacement = function(offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    $tip
      .offset(offset)
      .addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.$element.trigger('hidden.bs.' + this.type)

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth
    , height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.0.2
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, Button.DEFAULTS, options)
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d);
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
        .prop('checked', !this.$element.hasClass('active'))
        .trigger('change')
      if ($input.prop('type') === 'radio') $parent.find('.active').removeClass('active')
    }

    this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.0.2
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab'
      , relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(jQuery);

/*!
 PowerTip v1.2.0 (2015-01-27)
 http://stevenbenner.github.io/jquery-powertip/
 Copyright (c) 2015 Steven Benner (http://stevenbenner.com/).
 Released under MIT license.
 https://raw.github.com/stevenbenner/jquery-powertip/master/LICENSE.txt
*/
(function(factory) {
	// support loading the plugin as an amd module
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery' ], factory);
	} else {
		factory(jQuery);
	}
}(function($) {

	// useful private variables
	var $document = $(document),
		$window = $(window),
		$body = $('body');

	// constants
	var DATA_DISPLAYCONTROLLER = 'displayController',
		DATA_HASACTIVEHOVER = 'hasActiveHover',
		DATA_FORCEDOPEN = 'forcedOpen',
		DATA_HASMOUSEMOVE = 'hasMouseMove',
		DATA_MOUSEONTOTIP = 'mouseOnToPopup',
		DATA_ORIGINALTITLE = 'originalTitle',
		DATA_POWERTIP = 'powertip',
		DATA_POWERTIPJQ = 'powertipjq',
		DATA_POWERTIPTARGET = 'powertiptarget',
		EVENT_NAMESPACE = '.powertip',
		RAD2DEG = 180 / Math.PI;

	/**
	 * Session data
	 * Private properties global to all powerTip instances
	 */
	var session = {
		elements: null,
		tooltips: null,
		isTipOpen: false,
		isFixedTipOpen: false,
		isClosing: false,
		tipOpenImminent: false,
		activeHover: null,
		currentX: 0,
		currentY: 0,
		previousX: 0,
		previousY: 0,
		desyncTimeout: null,
		closeDelayTimeout: null,
		mouseTrackingActive: false,
		delayInProgress: false,
		windowWidth: 0,
		windowHeight: 0,
		scrollTop: 0,
		scrollLeft: 0
	};

	/**
	 * Collision enumeration
	 * @enum {number}
	 */
	var Collision = {
		none: 0,
		top: 1,
		bottom: 2,
		left: 4,
		right: 8
	};

	/**
	 * Display hover tooltips on the matched elements.
	 * @param {(Object|string)=} opts The options object to use for the plugin, or
	 *     the name of a method to invoke on the first matched element.
	 * @param {*=} [arg] Argument for an invoked method (optional).
	 * @return {jQuery} jQuery object for the matched selectors.
	 */
	$.fn.powerTip = function(opts, arg) {
		var targetElements = this,
			options,
			tipController;

		// don't do any work if there were no matched elements
		if (!targetElements.length) {
			return targetElements;
		}

		// handle api method calls on the plugin, e.g. powerTip('hide')
		if ($.type(opts) === 'string' && $.powerTip[opts]) {
			return $.powerTip[opts].call(targetElements, targetElements, arg);
		}

		// extend options and instantiate TooltipController
		options = $.extend({}, $.fn.powerTip.defaults, opts);
		tipController = new TooltipController(options);

		// hook mouse and viewport dimension tracking
		initTracking();

		// setup the elements
		targetElements.each(function elementSetup() {
			var $this = $(this),
				dataPowertip = $this.data(DATA_POWERTIP),
				dataElem = $this.data(DATA_POWERTIPJQ),
				dataTarget = $this.data(DATA_POWERTIPTARGET),
				title;

			// handle repeated powerTip calls on the same element by destroying the
			// original instance hooked to it and replacing it with this call
			if ($this.data(DATA_DISPLAYCONTROLLER)) {
				$.powerTip.destroy($this);
			}

			// attempt to use title attribute text if there is no data-powertip,
			// data-powertipjq or data-powertiptarget. If we do use the title
			// attribute, delete the attribute so the browser will not show it
			title = $this.attr('title');
			if (!dataPowertip && !dataTarget && !dataElem && title) {
				$this.data(DATA_POWERTIP, title);
				$this.data(DATA_ORIGINALTITLE, title);
				$this.removeAttr('title');
			}

			// create hover controllers for each element
			$this.data(
				DATA_DISPLAYCONTROLLER,
				new DisplayController($this, options, tipController)
			);
		});

		// attach events to matched elements if the manual option is not enabled
		if (!options.manual) {
			// attach open events
			$.each(options.openEvents, function(idx, evt) {
				if ($.inArray(evt, options.closeEvents) > -1) {
					// event is in both openEvents and closeEvents, so toggle it
					targetElements.on(evt + EVENT_NAMESPACE, function elementToggle(event) {
						$.powerTip.toggle(this, event);
					});
				} else {
					targetElements.on(evt + EVENT_NAMESPACE, function elementOpen(event) {
						$.powerTip.show(this, event);
					});
				}
			});

			// attach close events
			$.each(options.closeEvents, function(idx, evt) {
				if ($.inArray(evt, options.openEvents) < 0) {
					targetElements.on(evt + EVENT_NAMESPACE, function elementClose(event) {
						// set immediate to true for any event without mouse info
						$.powerTip.hide(this, !isMouseEvent(event));
					});
				}
			});

			// attach escape key close event
			targetElements.on('keydown' + EVENT_NAMESPACE, function elementKeyDown(event) {
				// always close tooltip when the escape key is pressed
				if (event.keyCode === 27) {
					$.powerTip.hide(this, true);
				}
			});
		}

		// remember elements that the plugin is attached to
		session.elements = session.elements ? session.elements.add(targetElements) : targetElements;

		return targetElements;
	};

	/**
	 * Default options for the powerTip plugin.
	 */
	$.fn.powerTip.defaults = {
		fadeInTime: 200,
		fadeOutTime: 100,
		followMouse: false,
		popupId: 'powerTip',
		popupClass: null,
		intentSensitivity: 7,
		intentPollInterval: 100,
		closeDelay: 100,
		placement: 'n',
		smartPlacement: false,
		offset: 10,
		mouseOnToPopup: false,
		manual: false,
		openEvents: [ 'mouseenter', 'focus' ],
		closeEvents: [ 'mouseleave', 'blur' ]
	};

	/**
	 * Default smart placement priority lists.
	 * The first item in the array is the highest priority, the last is the lowest.
	 * The last item is also the default, which will be used if all previous options
	 * do not fit.
	 */
	$.fn.powerTip.smartPlacementLists = {
		n: [ 'n', 'ne', 'nw', 's' ],
		e: [ 'e', 'ne', 'se', 'w', 'nw', 'sw', 'n', 's', 'e' ],
		s: [ 's', 'se', 'sw', 'n' ],
		w: [ 'w', 'nw', 'sw', 'e', 'ne', 'se', 'n', 's', 'w' ],
		nw: [ 'nw', 'w', 'sw', 'n', 's', 'se', 'nw' ],
		ne: [ 'ne', 'e', 'se', 'n', 's', 'sw', 'ne' ],
		sw: [ 'sw', 'w', 'nw', 's', 'n', 'ne', 'sw' ],
		se: [ 'se', 'e', 'ne', 's', 'n', 'nw', 'se' ],
		'nw-alt': [ 'nw-alt', 'n', 'ne-alt', 'sw-alt', 's', 'se-alt', 'w', 'e' ],
		'ne-alt': [ 'ne-alt', 'n', 'nw-alt', 'se-alt', 's', 'sw-alt', 'e', 'w' ],
		'sw-alt': [ 'sw-alt', 's', 'se-alt', 'nw-alt', 'n', 'ne-alt', 'w', 'e' ],
		'se-alt': [ 'se-alt', 's', 'sw-alt', 'ne-alt', 'n', 'nw-alt', 'e', 'w' ]
	};

	/**
	 * Public API
	 */
	$.powerTip = {
		/**
		 * Attempts to show the tooltip for the specified element.
		 * @param {jQuery|Element} element The element to open the tooltip for.
		 * @param {jQuery.Event=} event jQuery event for hover intent and mouse
		 *     tracking (optional).
		 * @return {jQuery|Element} The original jQuery object or DOM Element.
		 */
		show: function apiShowTip(element, event) {
			// if we were given a mouse event then run the hover intent testing,
			// otherwise, simply show the tooltip asap
			if (isMouseEvent(event)) {
				trackMouse(event);
				session.previousX = event.pageX;
				session.previousY = event.pageY;
				$(element).data(DATA_DISPLAYCONTROLLER).show();
			} else {
				$(element).first().data(DATA_DISPLAYCONTROLLER).show(true, true);
			}
			return element;
		},

		/**
		 * Repositions the tooltip on the element.
		 * @param {jQuery|Element} element The element the tooltip is shown for.
		 * @return {jQuery|Element} The original jQuery object or DOM Element.
		 */
		reposition: function apiResetPosition(element) {
			$(element).first().data(DATA_DISPLAYCONTROLLER).resetPosition();
			return element;
		},

		/**
		 * Attempts to close any open tooltips.
		 * @param {(jQuery|Element)=} element The element with the tooltip that
		 *     should be closed (optional).
		 * @param {boolean=} immediate Disable close delay (optional).
		 * @return {jQuery|Element|undefined} The original jQuery object or DOM
		 *     Element, if one was specified.
		 */
		hide: function apiCloseTip(element, immediate) {
			var displayController;

			// set immediate to true when no element is specified
			immediate = element ? immediate : true;

			// find the relevant display controller
			if (element) {
				displayController = $(element).first().data(DATA_DISPLAYCONTROLLER);
			} else if (session.activeHover) {
				displayController = session.activeHover.data(DATA_DISPLAYCONTROLLER);
			}

			// if found, hide the tip
			if (displayController) {
				displayController.hide(immediate);
			}

			return element;
		},

		/**
		 * Toggles the tooltip for the specified element. This will open a closed
		 * tooltip, or close an open tooltip.
		 * @param {jQuery|Element} element The element with the tooltip that
		 *     should be toggled.
		 * @param {jQuery.Event=} event jQuery event for hover intent and mouse
		 *     tracking (optional).
		 * @return {jQuery|Element} The original jQuery object or DOM Element.
		 */
		toggle: function apiToggle(element, event) {
			if (session.activeHover && session.activeHover.is(element)) {
				// tooltip for element is active, so close it
				$.powerTip.hide(element, !isMouseEvent(event));
			} else {
				// tooltip for element is not active, so open it
				$.powerTip.show(element, event);
			}
			return element;
		},

		/**
		 * Destroy and roll back any powerTip() instance on the specified elements.
		 * If no elements are specified then all elements that the plugin is
		 * currently attached to will be rolled back.
		 * @param {(jQuery|Element)=} element The element with the powerTip instance.
		 * @return {jQuery|Element|undefined} The original jQuery object or DOM
		 *     Element, if one was specified.
		 */
		destroy: function apiDestroy(element) {
			var $element = element ? $(element) : session.elements;

			// if the plugin is not hooked to any elements then there is no point
			// trying to destroy anything, or dealing with the possible errors
			if (!session.elements || session.elements.length === 0) {
				return element;
			}

			// unhook events and destroy plugin changes to each element
			$element.off(EVENT_NAMESPACE).each(function destroy() {
				var $this = $(this),
					dataAttributes = [
						DATA_ORIGINALTITLE,
						DATA_DISPLAYCONTROLLER,
						DATA_HASACTIVEHOVER,
						DATA_FORCEDOPEN
					];

				// revert title attribute
				if ($this.data(DATA_ORIGINALTITLE)) {
					$this.attr('title', $this.data(DATA_ORIGINALTITLE));
					dataAttributes.push(DATA_POWERTIP);
				}

				// remove data attributes
				$this.removeData(dataAttributes);
			});

			// remove destroyed element from active elements collection
			session.elements = session.elements.not($element);

			// if there are no active elements left then we will unhook all of the
			// events that we've bound code to and remove the tooltip elements
			if (session.elements.length === 0) {
				$window.off(EVENT_NAMESPACE);
				$document.off(EVENT_NAMESPACE);
				session.mouseTrackingActive = false;
				session.tooltips.remove();
				session.tooltips = null;
			}

			return element;
		}
	};

	// API aliasing
	$.powerTip.showTip = $.powerTip.show;
	$.powerTip.closeTip = $.powerTip.hide;

	/**
	 * Creates a new CSSCoordinates object.
	 * @private
	 * @constructor
	 */
	function CSSCoordinates() {
		var me = this;

		// initialize object properties
		me.top = 'auto';
		me.left = 'auto';
		me.right = 'auto';
		me.bottom = 'auto';

		/**
		 * Set a property to a value.
		 * @private
		 * @param {string} property The name of the property.
		 * @param {number} value The value of the property.
		 */
		me.set = function(property, value) {
			if ($.isNumeric(value)) {
				me[property] = Math.round(value);
			}
		};
	}

	/**
	 * Creates a new tooltip display controller.
	 * @private
	 * @constructor
	 * @param {jQuery} element The element that this controller will handle.
	 * @param {Object} options Options object containing settings.
	 * @param {TooltipController} tipController The TooltipController object for
	 *     this instance.
	 */
	function DisplayController(element, options, tipController) {
		var hoverTimer = null,
			myCloseDelay = null;

		/**
		 * Begins the process of showing a tooltip.
		 * @private
		 * @param {boolean=} immediate Skip intent testing (optional).
		 * @param {boolean=} forceOpen Ignore cursor position and force tooltip to
		 *     open (optional).
		 */
		function openTooltip(immediate, forceOpen) {
			cancelTimer();
			if (!element.data(DATA_HASACTIVEHOVER)) {
				if (!immediate) {
					session.tipOpenImminent = true;
					hoverTimer = setTimeout(
						function intentDelay() {
							hoverTimer = null;
							checkForIntent();
						},
						options.intentPollInterval
					);
				} else {
					if (forceOpen) {
						element.data(DATA_FORCEDOPEN, true);
					}
					tipController.showTip(element);
				}
			} else {
				// cursor left and returned to this element, cancel close
				cancelClose();
			}
		}

		/**
		 * Begins the process of closing a tooltip.
		 * @private
		 * @param {boolean=} disableDelay Disable close delay (optional).
		 */
		function closeTooltip(disableDelay) {
			cancelTimer();
			session.tipOpenImminent = false;
			if (element.data(DATA_HASACTIVEHOVER)) {
				element.data(DATA_FORCEDOPEN, false);
				if (!disableDelay) {
					session.delayInProgress = true;
					session.closeDelayTimeout = setTimeout(
						function closeDelay() {
							session.closeDelayTimeout = null;
							tipController.hideTip(element);
							session.delayInProgress = false;
							myCloseDelay = null;
						},
						options.closeDelay
					);
					// save internal reference close delay id so we can check if the
					// active close delay belongs to this instance
					myCloseDelay = session.closeDelayTimeout;
				} else {
					tipController.hideTip(element);
				}
			}
		}

		/**
		 * Checks mouse position to make sure that the user intended to hover on the
		 * specified element before showing the tooltip.
		 * @private
		 */
		function checkForIntent() {
			// calculate mouse position difference
			var xDifference = Math.abs(session.previousX - session.currentX),
				yDifference = Math.abs(session.previousY - session.currentY),
				totalDifference = xDifference + yDifference;

			// check if difference has passed the sensitivity threshold
			if (totalDifference < options.intentSensitivity) {
				cancelClose();
				tipController.showTip(element);
			} else {
				// try again
				session.previousX = session.currentX;
				session.previousY = session.currentY;
				openTooltip();
			}
		}

		/**
		 * Cancels active hover timer.
		 * @private
		 * @param {boolean=} stopClose Cancel any active close delay timer.
		 */
		function cancelTimer(stopClose) {
			hoverTimer = clearTimeout(hoverTimer);
			// cancel the current close delay if the active close delay is for this
			// element or the stopClose argument is true
			if (session.closeDelayTimeout && myCloseDelay === session.closeDelayTimeout || stopClose) {
				cancelClose();
			}
		}

		/**
		 * Cancels any active close delay timer.
		 * @private
		 */
		function cancelClose() {
			session.closeDelayTimeout = clearTimeout(session.closeDelayTimeout);
			session.delayInProgress = false;
		}

		/**
		 * Repositions the tooltip on this element.
		 * @private
		 */
		function repositionTooltip() {
			tipController.resetPosition(element);
		}

		// expose the methods
		this.show = openTooltip;
		this.hide = closeTooltip;
		this.cancel = cancelTimer;
		this.resetPosition = repositionTooltip;
	}

	/**
	 * Creates a new Placement Calculator.
	 * @private
	 * @constructor
	 */
	function PlacementCalculator() {
		/**
		 * Compute the CSS position to display a tooltip at the specified placement
		 * relative to the specified element.
		 * @private
		 * @param {jQuery} element The element that the tooltip should target.
		 * @param {string} placement The placement for the tooltip.
		 * @param {number} tipWidth Width of the tooltip element in pixels.
		 * @param {number} tipHeight Height of the tooltip element in pixels.
		 * @param {number} offset Distance to offset tooltips in pixels.
		 * @return {CSSCoordinates} A CSSCoordinates object with the position.
		 */
		function computePlacementCoords(element, placement, tipWidth, tipHeight, offset) {
			var placementBase = placement.split('-')[0], // ignore 'alt' for corners
				coords = new CSSCoordinates(),
				position;

			if (isSvgElement(element)) {
				position = getSvgPlacement(element, placementBase);
			} else {
				position = getHtmlPlacement(element, placementBase);
			}

			// calculate the appropriate x and y position in the document
			switch (placement) {
			case 'n':
				coords.set('left', position.left - (tipWidth / 2));
				coords.set('bottom', session.windowHeight - position.top + offset);
				break;
			case 'e':
				coords.set('left', position.left + offset);
				coords.set('top', position.top - (tipHeight / 2));
				break;
			case 's':
				coords.set('left', position.left - (tipWidth / 2));
				coords.set('top', position.top + offset);
				break;
			case 'w':
				coords.set('top', position.top - (tipHeight / 2));
				coords.set('right', session.windowWidth - position.left + offset);
				break;
			case 'nw':
				coords.set('bottom', session.windowHeight - position.top + offset);
				coords.set('right', session.windowWidth - position.left - 20);
				break;
			case 'nw-alt':
				coords.set('left', position.left);
				coords.set('bottom', session.windowHeight - position.top + offset);
				break;
			case 'ne':
				coords.set('left', position.left - 20);
				coords.set('bottom', session.windowHeight - position.top + offset);
				break;
			case 'ne-alt':
				coords.set('bottom', session.windowHeight - position.top + offset);
				coords.set('right', session.windowWidth - position.left);
				break;
			case 'sw':
				coords.set('top', position.top + offset);
				coords.set('right', session.windowWidth - position.left - 20);
				break;
			case 'sw-alt':
				coords.set('left', position.left);
				coords.set('top', position.top + offset);
				break;
			case 'se':
				coords.set('left', position.left - 20);
				coords.set('top', position.top + offset);
				break;
			case 'se-alt':
				coords.set('top', position.top + offset);
				coords.set('right', session.windowWidth - position.left);
				break;
			}

			return coords;
		}

		/**
		 * Finds the tooltip attachment point in the document for a HTML DOM element
		 * for the specified placement.
		 * @private
		 * @param {jQuery} element The element that the tooltip should target.
		 * @param {string} placement The placement for the tooltip.
		 * @return {Object} An object with the top,left position values.
		 */
		function getHtmlPlacement(element, placement) {
			var objectOffset = element.offset(),
				objectWidth = element.outerWidth(),
				objectHeight = element.outerHeight(),
				left,
				top;

			// calculate the appropriate x and y position in the document
			switch (placement) {
			case 'n':
				left = objectOffset.left + objectWidth / 2;
				top = objectOffset.top;
				break;
			case 'e':
				left = objectOffset.left + objectWidth;
				top = objectOffset.top + objectHeight / 2;
				break;
			case 's':
				left = objectOffset.left + objectWidth / 2;
				top = objectOffset.top + objectHeight;
				break;
			case 'w':
				left = objectOffset.left;
				top = objectOffset.top + objectHeight / 2;
				break;
			case 'nw':
				left = objectOffset.left;
				top = objectOffset.top;
				break;
			case 'ne':
				left = objectOffset.left + objectWidth;
				top = objectOffset.top;
				break;
			case 'sw':
				left = objectOffset.left;
				top = objectOffset.top + objectHeight;
				break;
			case 'se':
				left = objectOffset.left + objectWidth;
				top = objectOffset.top + objectHeight;
				break;
			}

			return {
				top: top,
				left: left
			};
		}

		/**
		 * Finds the tooltip attachment point in the document for a SVG element for
		 * the specified placement.
		 * @private
		 * @param {jQuery} element The element that the tooltip should target.
		 * @param {string} placement The placement for the tooltip.
		 * @return {Object} An object with the top,left position values.
		 */
		function getSvgPlacement(element, placement) {
			var svgElement = element.closest('svg')[0],
				domElement = element[0],
				point = svgElement.createSVGPoint(),
				boundingBox = domElement.getBBox(),
				matrix = domElement.getScreenCTM(),
				halfWidth = boundingBox.width / 2,
				halfHeight = boundingBox.height / 2,
				placements = [],
				placementKeys = [ 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w' ],
				coords,
				rotation,
				steps,
				x;

			function pushPlacement() {
				placements.push(point.matrixTransform(matrix));
			}

			// get bounding box corners and midpoints
			point.x = boundingBox.x;
			point.y = boundingBox.y;
			pushPlacement();
			point.x += halfWidth;
			pushPlacement();
			point.x += halfWidth;
			pushPlacement();
			point.y += halfHeight;
			pushPlacement();
			point.y += halfHeight;
			pushPlacement();
			point.x -= halfWidth;
			pushPlacement();
			point.x -= halfWidth;
			pushPlacement();
			point.y -= halfHeight;
			pushPlacement();

			// determine rotation
			if (placements[0].y !== placements[1].y || placements[0].x !== placements[7].x) {
				rotation = Math.atan2(matrix.b, matrix.a) * RAD2DEG;
				steps = Math.ceil(((rotation % 360) - 22.5) / 45);
				if (steps < 1) {
					steps += 8;
				}
				while (steps--) {
					placementKeys.push(placementKeys.shift());
				}
			}

			// find placement
			for (x = 0; x < placements.length; x++) {
				if (placementKeys[x] === placement) {
					coords = placements[x];
					break;
				}
			}

			return {
				top: coords.y + session.scrollTop,
				left: coords.x + session.scrollLeft
			};
		}

		// expose methods
		this.compute = computePlacementCoords;
	}

	/**
	 * Creates a new tooltip controller.
	 * @private
	 * @constructor
	 * @param {Object} options Options object containing settings.
	 */
	function TooltipController(options) {
		var placementCalculator = new PlacementCalculator(),
			tipElement = $('#' + options.popupId);

		// build and append tooltip div if it does not already exist
		if (tipElement.length === 0) {
			tipElement = $('<div/>', { id: options.popupId });
			// grab body element if it was not populated when the script loaded
			// note: this hack exists solely for jsfiddle support
			if ($body.length === 0) {
				$body = $('body');
			}
			$body.append(tipElement);
			// remember the tooltip elements that the plugin has created
			session.tooltips = session.tooltips ? session.tooltips.add(tipElement) : tipElement;
		}

		// hook mousemove for cursor follow tooltips
		if (options.followMouse) {
			// only one positionTipOnCursor hook per tooltip element, please
			if (!tipElement.data(DATA_HASMOUSEMOVE)) {
				$document.on('mousemove' + EVENT_NAMESPACE, positionTipOnCursor);
				$window.on('scroll' + EVENT_NAMESPACE, positionTipOnCursor);
				tipElement.data(DATA_HASMOUSEMOVE, true);
			}
		}

		/**
		 * Gives the specified element the active-hover state and queues up the
		 * showTip function.
		 * @private
		 * @param {jQuery} element The element that the tooltip should target.
		 */
		function beginShowTip(element) {
			element.data(DATA_HASACTIVEHOVER, true);
			// show tooltip, asap
			tipElement.queue(function queueTipInit(next) {
				showTip(element);
				next();
			});
		}

		/**
		 * Shows the tooltip, as soon as possible.
		 * @private
		 * @param {jQuery} element The element that the tooltip should target.
		 */
		function showTip(element) {
			var tipContent;

			// it is possible, especially with keyboard navigation, to move on to
			// another element with a tooltip during the queue to get to this point
			// in the code. if that happens then we need to not proceed or we may
			// have the fadeout callback for the last tooltip execute immediately
			// after this code runs, causing bugs.
			if (!element.data(DATA_HASACTIVEHOVER)) {
				return;
			}

			// if the tooltip is open and we got asked to open another one then the
			// old one is still in its fadeOut cycle, so wait and try again
			if (session.isTipOpen) {
				if (!session.isClosing) {
					hideTip(session.activeHover);
				}
				tipElement.delay(100).queue(function queueTipAgain(next) {
					showTip(element);
					next();
				});
				return;
			}

			// trigger powerTipPreRender event
			element.trigger('powerTipPreRender');

			// set tooltip content
			tipContent = getTooltipContent(element);
			if (tipContent) {
				tipElement.empty().append(tipContent);
			} else {
				// we have no content to display, give up
				return;
			}

			// trigger powerTipRender event
			element.trigger('powerTipRender');

			session.activeHover = element;
			session.isTipOpen = true;

			tipElement.data(DATA_MOUSEONTOTIP, options.mouseOnToPopup);

			// set tooltip position
			if (!options.followMouse) {
				positionTipOnElement(element);
				session.isFixedTipOpen = true;
			} else {
				positionTipOnCursor();
			}

			// add custom class to tooltip element
			tipElement.addClass(options.popupClass);

			// close tooltip when clicking anywhere on the page, with the exception
			// of the tooltip's trigger element and any elements that are within a
			// tooltip that has 'mouseOnToPopup' option enabled
			$document.on('click' + EVENT_NAMESPACE, function documentClick(event) {
				var target = event.target;
				if (target !== element[0]) {
					if (options.mouseOnToPopup) {
						if (target !== tipElement[0] && !$.contains(tipElement[0], target)) {
							$.powerTip.hide();
						}
					} else {
						$.powerTip.hide();
					}
				}
			});

			// if we want to be able to mouse on to the tooltip then we need to
			// attach hover events to the tooltip that will cancel a close request
			// on mouseenter and start a new close request on mouseleave
			// only hook these listeners if we're not in manual mode
			if (options.mouseOnToPopup && !options.manual) {
				tipElement.on('mouseenter' + EVENT_NAMESPACE, function tipMouseEnter() {
					// check activeHover in case the mouse cursor entered the
					// tooltip during the fadeOut and close cycle
					if (session.activeHover) {
						session.activeHover.data(DATA_DISPLAYCONTROLLER).cancel();
					}
				});
				tipElement.on('mouseleave' + EVENT_NAMESPACE, function tipMouseLeave() {
					// check activeHover in case the mouse cursor left the tooltip
					// during the fadeOut and close cycle
					if (session.activeHover) {
						session.activeHover.data(DATA_DISPLAYCONTROLLER).hide();
					}
				});
			}

			// fadein
			tipElement.fadeIn(options.fadeInTime, function fadeInCallback() {
				// start desync polling
				if (!session.desyncTimeout) {
					session.desyncTimeout = setInterval(closeDesyncedTip, 500);
				}

				// trigger powerTipOpen event
				element.trigger('powerTipOpen');
			});
		}

		/**
		 * Hides the tooltip.
		 * @private
		 * @param {jQuery} element The element that the tooltip should target.
		 */
		function hideTip(element) {
			// reset session
			session.isClosing = true;
			session.isTipOpen = false;

			// stop desync polling
			session.desyncTimeout = clearInterval(session.desyncTimeout);

			// reset element state
			element.data(DATA_HASACTIVEHOVER, false);
			element.data(DATA_FORCEDOPEN, false);

			// remove document click handler
			$document.off('click' + EVENT_NAMESPACE);

			// unbind the mouseOnToPopup events if they were set
			tipElement.off(EVENT_NAMESPACE);

			// fade out
			tipElement.fadeOut(options.fadeOutTime, function fadeOutCallback() {
				var coords = new CSSCoordinates();

				// reset session and tooltip element
				session.activeHover = null;
				session.isClosing = false;
				session.isFixedTipOpen = false;
				tipElement.removeClass();

				// support mouse-follow and fixed position tips at the same time by
				// moving the tooltip to the last cursor location after it is hidden
				coords.set('top', session.currentY + options.offset);
				coords.set('left', session.currentX + options.offset);
				tipElement.css(coords);

				// trigger powerTipClose event
				element.trigger('powerTipClose');
			});
		}

		/**
		 * Moves the tooltip to the users mouse cursor.
		 * @private
		 */
		function positionTipOnCursor() {
			// to support having fixed tooltips on the same page as cursor tooltips,
			// where both instances are referencing the same tooltip element, we
			// need to keep track of the mouse position constantly, but we should
			// only set the tip location if a fixed tip is not currently open, a tip
			// open is imminent or active, and the tooltip element in question does
			// have a mouse-follow using it.
			if (!session.isFixedTipOpen && (session.isTipOpen || (session.tipOpenImminent && tipElement.data(DATA_HASMOUSEMOVE)))) {
				// grab measurements
				var tipWidth = tipElement.outerWidth(),
					tipHeight = tipElement.outerHeight(),
					coords = new CSSCoordinates(),
					collisions,
					collisionCount;

				// grab collisions
				coords.set('top', session.currentY + options.offset);
				coords.set('left', session.currentX + options.offset);
				collisions = getViewportCollisions(
					coords,
					tipWidth,
					tipHeight
				);

				// handle tooltip view port collisions
				if (collisions !== Collision.none) {
					collisionCount = countFlags(collisions);
					if (collisionCount === 1) {
						// if there is only one collision (bottom or right) then
						// simply constrain the tooltip to the view port
						if (collisions === Collision.right) {
							coords.set('left', session.windowWidth - tipWidth);
						} else if (collisions === Collision.bottom) {
							coords.set('top', session.scrollTop + session.windowHeight - tipHeight);
						}
					} else {
						// if the tooltip has more than one collision then it is
						// trapped in the corner and should be flipped to get it out
						// of the users way
						coords.set('left', session.currentX - tipWidth - options.offset);
						coords.set('top', session.currentY - tipHeight - options.offset);
					}
				}

				// position the tooltip
				tipElement.css(coords);
			}
		}

		/**
		 * Sets the tooltip to the correct position relative to the specified target
		 * element. Based on options settings.
		 * @private
		 * @param {jQuery} element The element that the tooltip should target.
		 */
		function positionTipOnElement(element) {
			var priorityList,
				finalPlacement;

			if (options.smartPlacement) {
				priorityList = $.fn.powerTip.smartPlacementLists[options.placement];

				// iterate over the priority list and use the first placement option
				// that does not collide with the view port. if they all collide
				// then the last placement in the list will be used.
				$.each(priorityList, function(idx, pos) {
					// place tooltip and find collisions
					var collisions = getViewportCollisions(
						placeTooltip(element, pos),
						tipElement.outerWidth(),
						tipElement.outerHeight()
					);

					// update the final placement variable
					finalPlacement = pos;

					// break if there were no collisions
					if (collisions === Collision.none) {
						return false;
					}
				});
			} else {
				// if we're not going to use the smart placement feature then just
				// compute the coordinates and do it
				placeTooltip(element, options.placement);
				finalPlacement = options.placement;
			}

			// add placement as class for CSS arrows
			tipElement.addClass(finalPlacement);
		}

		/**
		 * Sets the tooltip position to the appropriate values to show the tip at
		 * the specified placement. This function will iterate and test the tooltip
		 * to support elastic tooltips.
		 * @private
		 * @param {jQuery} element The element that the tooltip should target.
		 * @param {string} placement The placement for the tooltip.
		 * @return {CSSCoordinates} A CSSCoordinates object with the top, left, and
		 *     right position values.
		 */
		function placeTooltip(element, placement) {
			var iterationCount = 0,
				tipWidth,
				tipHeight,
				coords = new CSSCoordinates();

			// set the tip to 0,0 to get the full expanded width
			coords.set('top', 0);
			coords.set('left', 0);
			tipElement.css(coords);

			// to support elastic tooltips we need to check for a change in the
			// rendered dimensions after the tooltip has been positioned
			do {
				// grab the current tip dimensions
				tipWidth = tipElement.outerWidth();
				tipHeight = tipElement.outerHeight();

				// get placement coordinates
				coords = placementCalculator.compute(
					element,
					placement,
					tipWidth,
					tipHeight,
					options.offset
				);

				// place the tooltip
				tipElement.css(coords);
			} while (
				// sanity check: limit to 5 iterations, and...
				++iterationCount <= 5 &&
				// try again if the dimensions changed after placement
				(tipWidth !== tipElement.outerWidth() || tipHeight !== tipElement.outerHeight())
			);

			return coords;
		}

		/**
		 * Checks for a tooltip desync and closes the tooltip if one occurs.
		 * @private
		 */
		function closeDesyncedTip() {
			var isDesynced = false;
			// It is possible for the mouse cursor to leave an element without
			// firing the mouseleave or blur event. This most commonly happens when
			// the element is disabled under mouse cursor. If this happens it will
			// result in a desynced tooltip because the tooltip was never asked to
			// close. So we should periodically check for a desync situation and
			// close the tip if such a situation arises.
			if (session.isTipOpen && !session.isClosing && !session.delayInProgress && ($.inArray('mouseleave', options.closeEvents) > -1 || $.inArray('mouseout', options.closeEvents) > -1 || $.inArray('blur', options.closeEvents) > -1 || $.inArray('focusout', options.closeEvents) > -1)) {
				// user moused onto another tip or active hover is disabled
				if (session.activeHover.data(DATA_HASACTIVEHOVER) === false || session.activeHover.is(':disabled')) {
					isDesynced = true;
				} else {
					// hanging tip - have to test if mouse position is not over the
					// active hover and not over a tooltip set to let the user
					// interact with it.
					// for keyboard navigation: this only counts if the element does
					// not have focus.
					// for tooltips opened via the api: we need to check if it has
					// the forcedOpen flag.
					if (!isMouseOver(session.activeHover) && !session.activeHover.is(':focus') && !session.activeHover.data(DATA_FORCEDOPEN)) {
						if (tipElement.data(DATA_MOUSEONTOTIP)) {
							if (!isMouseOver(tipElement)) {
								isDesynced = true;
							}
						} else {
							isDesynced = true;
						}
					}
				}

				if (isDesynced) {
					// close the desynced tip
					hideTip(session.activeHover);
				}
			}
		}

		// expose methods
		this.showTip = beginShowTip;
		this.hideTip = hideTip;
		this.resetPosition = positionTipOnElement;
	}

	/**
	 * Determine whether a jQuery object is an SVG element
	 * @private
	 * @param {jQuery} element The element to check
	 * @return {boolean} Whether this is an SVG element
	 */
	function isSvgElement(element) {
		return Boolean(window.SVGElement && element[0] instanceof SVGElement);
	}

	/**
	 * Determines if the specified jQuery.Event object has mouse data.
	 * @private
	 * @param {jQuery.Event=} event The jQuery.Event object to test.
	 * @return {boolean} True if there is mouse data, otherwise false.
	 */
	function isMouseEvent(event) {
		return Boolean(event && typeof event.pageX === 'number');
	}

	/**
	 * Initializes the viewport dimension cache and hooks up the mouse position
	 * tracking and viewport dimension tracking events.
	 * Prevents attaching the events more than once.
	 * @private
	 */
	function initTracking() {
		if (!session.mouseTrackingActive) {
			session.mouseTrackingActive = true;

			// grab the current viewport dimensions on load
			getViewportDimensions();
			$(getViewportDimensions);

			// hook mouse move tracking
			$document.on('mousemove' + EVENT_NAMESPACE, trackMouse);

			// hook viewport dimensions tracking
			$window.on('resize' + EVENT_NAMESPACE, trackResize);
			$window.on('scroll' + EVENT_NAMESPACE, trackScroll);
		}
	}

	/**
	 * Updates the viewport dimensions cache.
	 * @private
	 */
	function getViewportDimensions() {
		session.scrollLeft = $window.scrollLeft();
		session.scrollTop = $window.scrollTop();
		session.windowWidth = $window.width();
		session.windowHeight = $window.height();
	}

	/**
	 * Updates the window size info in the viewport dimensions cache.
	 * @private
	 */
	function trackResize() {
		session.windowWidth = $window.width();
		session.windowHeight = $window.height();
	}

	/**
	 * Updates the scroll offset info in the viewport dimensions cache.
	 * @private
	 */
	function trackScroll() {
		var x = $window.scrollLeft(),
			y = $window.scrollTop();
		if (x !== session.scrollLeft) {
			session.currentX += x - session.scrollLeft;
			session.scrollLeft = x;
		}
		if (y !== session.scrollTop) {
			session.currentY += y - session.scrollTop;
			session.scrollTop = y;
		}
	}

	/**
	 * Saves the current mouse coordinates to the session object.
	 * @private
	 * @param {jQuery.Event} event The mousemove event for the document.
	 */
	function trackMouse(event) {
		session.currentX = event.pageX;
		session.currentY = event.pageY;
	}

	/**
	 * Tests if the mouse is currently over the specified element.
	 * @private
	 * @param {jQuery} element The element to check for hover.
	 * @return {boolean}
	 */
	function isMouseOver(element) {
		// use getBoundingClientRect() because jQuery's width() and height()
		// methods do not work with SVG elements
		// compute width/height because those properties do not exist on the object
		// returned by getBoundingClientRect() in older versions of IE
		var elementPosition = element.offset(),
			elementBox = element[0].getBoundingClientRect(),
			elementWidth = elementBox.right - elementBox.left,
			elementHeight = elementBox.bottom - elementBox.top;

		return session.currentX >= elementPosition.left &&
			session.currentX <= elementPosition.left + elementWidth &&
			session.currentY >= elementPosition.top &&
			session.currentY <= elementPosition.top + elementHeight;
	}

	/**
	 * Fetches the tooltip content from the specified element's data attributes.
	 * @private
	 * @param {jQuery} element The element to get the tooltip content for.
	 * @return {(string|jQuery|undefined)} The text/HTML string, jQuery object, or
	 *     undefined if there was no tooltip content for the element.
	 */
	function getTooltipContent(element) {
		var tipText = element.data(DATA_POWERTIP),
			tipObject = element.data(DATA_POWERTIPJQ),
			tipTarget = element.data(DATA_POWERTIPTARGET),
			targetElement,
			content;

		if (tipText) {
			if ($.isFunction(tipText)) {
				tipText = tipText.call(element[0]);
			}
			content = tipText;
		} else if (tipObject) {
			if ($.isFunction(tipObject)) {
				tipObject = tipObject.call(element[0]);
			}
			if (tipObject.length > 0) {
				content = tipObject.clone(true, true);
			}
		} else if (tipTarget) {
			targetElement = $('#' + tipTarget);
			if (targetElement.length > 0) {
				content = targetElement.html();
			}
		}

		return content;
	}

	/**
	 * Finds any viewport collisions that an element (the tooltip) would have if it
	 * were absolutely positioned at the specified coordinates.
	 * @private
	 * @param {CSSCoordinates} coords Coordinates for the element.
	 * @param {number} elementWidth Width of the element in pixels.
	 * @param {number} elementHeight Height of the element in pixels.
	 * @return {number} Value with the collision flags.
	 */
	function getViewportCollisions(coords, elementWidth, elementHeight) {
		var viewportTop = session.scrollTop,
			viewportLeft =  session.scrollLeft,
			viewportBottom = viewportTop + session.windowHeight,
			viewportRight = viewportLeft + session.windowWidth,
			collisions = Collision.none;

		if (coords.top < viewportTop || Math.abs(coords.bottom - session.windowHeight) - elementHeight < viewportTop) {
			collisions |= Collision.top;
		}
		if (coords.top + elementHeight > viewportBottom || Math.abs(coords.bottom - session.windowHeight) > viewportBottom) {
			collisions |= Collision.bottom;
		}
		if (coords.left < viewportLeft || coords.right + elementWidth > viewportRight) {
			collisions |= Collision.left;
		}
		if (coords.left + elementWidth > viewportRight || coords.right < viewportLeft) {
			collisions |= Collision.right;
		}

		return collisions;
	}

	/**
	 * Counts the number of bits set on a flags value.
	 * @param {number} value The flags value.
	 * @return {number} The number of bits that have been set.
	 */
	function countFlags(value) {
		var count = 0;
		while (value) {
			value &= value - 1;
			count++;
		}
		return count;
	}

}));