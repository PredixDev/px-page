/**
 * Behavior that manages the px-pages.
 *
 * @polymerBehavior
 * @type {{behaviors: *[], properties: {selected: {type: Number, reflectToAttribute: boolean, notify: boolean, observer: string, value: number}, selectedPage: {type: Object, value: {}}, mainPage: {type: Object, value: {}}, context: {type: Object, value: {}}, pages: {type: Array}, _PageList: {type: Array}, selectedIndex: {type: Number}, selectedClass: {type: String, value: string}, routes: {type: Object, value: {}}, inTransition: {type: String}, outTransition: {type: String}, updateHash: {type: Boolean, value: boolean}, debug: {type: Boolean, value: boolean}}, handleTrack: PagesBehavior.handleTrack, emit: PagesBehavior.emit, on: PagesBehavior.on, created: PagesBehavior.created, attached: PagesBehavior.attached, updatePage: PagesBehavior.updatePage}}
 */

var PagesBehavior = {
  properties: {

    /**
     * The selected index
     */
    selected: {
      type: Number,
      reflectToAttribute: true,
      notify: true,
      observer: '_setCurrent',
      value: 0
    },

    /**
     * The current active page object
     */
    selectedPage: {
      type: Object
    },

    /**
     * The main page
     */
    mainPage: {
      type: Object
    },

    /**
     * The array of indexed pages
     */
    pages: {
      type: Array
    },

    /**
     * The class to set on element when selected.
     */
    selectedClass: {
      type: String,
      value: 'current'
    },

    /**
     * Update the URL with the current page #id attribute
     * @private
     */
    updateHash: {
      type: Boolean,
      value: false
    },

    /**
     * Enable debug logging
     * @private
     */
    _debug: {
      type: Boolean,
      value: false
    }
  },
  _init: function () {
    var self = this;
    var pages = this.getPages();
    var len = pages.length;
    for (var i = 0; i < len; i++) {
      self._log('page', pages[i]);
      self._addPage(pages[i]);
    }
    this.fire('ready');
  },
  created: function () {
    this._PageMap = {};
    this._PageList = [];
    this.toggleClass('px-pages__wrapper');
  },
  attached: function () {
    var _this = this;
    if (!this.id) {
      throw 'pages' + this.tagName + ' cannot be created without an id!';
    }
    //  this.listen(this, 'track', 'handleTrack');
    this.async(function () {
      _this._init();
      _this.toggleClass('et-wrapper');

    });
    _this.gotoIndex(_this.selected);
  },
  detached: function () {
    this._log('detached');
  },
  /**
   * Set the current page
   */
  _setCurrent: function (index, oldIndex) {
    var _this = this;
    var prevPage = _this.getContentChildren()[index - 1];
    var currPage = _this.getContentChildren()[index];
    var nextPage = _this.getContentChildren()[index + 1];

    this._clearCurrent();
    if (nextPage) {
      _this._log('nextPage', nextPage);
      _this.toggleClass('next', true, nextPage);
      //  nextPage.toggleClass(_this.selectedClass, false);
      _this.toggleClass('previous', false, nextPage);
    }

    if (prevPage) {
      _this._log('prevPage', prevPage);
      _this.toggleClass('next', false, prevPage);
      //  prevPage.toggleClass(_this.selectedClass, false);
      _this.toggleClass('previous', true, prevPage);
    }

    if (currPage) {
      _this._log('currPage', _this.selectedClass, currPage);
      currPage.nextPage = nextPage;
      currPage.prevPage = prevPage;
      _this.toggleClass('next', false, currPage);
      _this.toggleClass('previous', false, currPage);
      _this.toggleClass(_this.selectedClass, true, currPage);
      _this.selectedPage = currPage;
      _this.fire('change', currPage);
    }
    return currPage;
  },
  /**
   * Goto a page by index or id
   * @return {Object} Page element object
   */
  goto: function (indexOrId) {
    var p = null;
    if (this._PageList[indexOrId]) {
      p = this._PageList[indexOrId];
      return this._setCurrent(indexOrId);
    } else if (this._PageMap[indexOrId]) {
      p = this._PageMap[indexOrId];
      return this._setCurrent(this.indexOf(p));
    } else {
      return false;
    }
  },
  /**
   * Handle adding a Page to the map and any neccessary properties for mapping.
   * @param Page
   * @private
   */
  _addPage: function (Page) {

    if (Page.dialog) {
      return;
    }
    if (Page.main) {
      Page.toggleClass(this.selectedClass, true);
      PagesBehavior._log('Got main page, saving', Page);
      this.mainPage = Page;
    }
    //add the index to the el
    Page.setAttribute('index', this._PageList.length.toString());

    //push to Page list
    this._PageList.push(Page);

    //add next class to element
    this.toggleClass('et-page', true, Page);
    //Page.toggleClass('next');

    //add to Page map
    this._PageMap[Page.id] = Page;

    this.fire('add', Page);
  },
  /**
   * Resets all pages to there initial state.
   */
  reset: function (selected) {
    var self = this;
    var _pages = this.getPages();
    var len = _pages.length;
    this._clearCurrent();
    for (var i = 0; i < len; i++) {
      self._log('resetting', i, _pages[i]);
      _pages[i].toggleClass(self.selectedClass);
      _pages[i].toggleClass('next');
      _pages[i].toggleClass('previous');
    }
    _pages[this.selected].toggleClass(self.selectedClass);
    this.selected = selected || 0;
  },
  /**
   * Goto a page by index
   * @return {Object} Page element object
   */
  gotoIndex: function (index) {
    PagesBehavior._log('gotoIndex', index);
    var _this = this;
    var _pages = _this.getPages();

    if (_pages[index]) {
      _pages[index].toggleClass(_this.selectedClass, false);
      _pages[index].toggleClass('previous', false);
      _pages[index].toggleClass('next', false);
      _this.selected = index;
      return _this.selectedPage;
    } else {
      return false;
    }
  },

  /**
   * Return the index of the page.
   * @param page
   * @return {Number} The page index
   */
  indexOf: function (page) {
    var i = this._PageList.indexOf(page);
    if (i > -1) {
      return i;
    } else {
      return false;
    }
  },

  /**
   * Goto a page by #id
   * @return {Object} Page element object
   */
  gotoPage: function (id) {
    this._log('gotoPage', id);
    var index = 0;
    var page = this._PageMap[id];
    if (page) {
      index = this.indexOf(page);
      if (index > -1) {
        this.selected = index;
        return page;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },

  /**
   * Utility method for logging a warn to the console.
   * @param type
   * @param message
   */
  _warn: function (type, message) {
    if (this._debug) {
      console.warn('PagesBehavior.' + type, message);
    }
  },
  /**
   * Utility method for logging to the console.
   * @param type
   * @param message
   */
  _log: function (type, message) {
    if (this._debug) {
      console.log('PagesBehavior.' + type, message);
    }
  },
  /**
   * Clears the current page
   * @private
   */
  _clearCurrent: function () {
    var self = this;
    var _pages = this.queryAllEffectiveChildren('px-page');
    if (_pages) {
      for (var i = 0; i < _pages.length; i++) {
        self._log('_clearCurrent', self.selectedClass, _pages[i]);
        self.toggleClass(self.selectedClass, false, _pages[i]);
      }
    }
  },

  /**
   * Get the current selected page
   * @return {Object} Page element object
   */
  getSelectedPage: function () {
    return this.selectedPage;
  },
  /**
   * Handle returning the previous page.
   * @return {Object} Page element object
   */
  getPrevPage: function () {
    return this._PageList[this.selected - 1];
  },
  /**
   * Handle returning the next page.
   * @return {Object} Page element object
   */
  getNextPage: function () {
    return this._PageList[this.selected + 1];
  },

  /**
   * Handle updating the location.hash
   * @private
   */
  _updateHash: function () {
    if (this.updateHash) {
      window.location.hash = this.getCurrentPage().id;
    }
  },

  /**
   * Handle setting the current page.
   * @param index
   * @return {*}
   */
  current: function (index) {
    this.selected = index || this.selected;
    this._log('current', this.selected);
    return this.gotoIndex(this.selected);
  },
  /**
   * Handle going to the next page in the index.
   * @return {Number} Index
   */
  next: function () {
    this._log('next', this.selected);
    if (this.selected >= this._PageList.length - 1) {
      if (this.loop) {
        return this.reset();
      }
      this._warn('next', 'end of page stack!');
      return;
    } else {
      return this.selected++;
    }
    return this.current();
  },
  /**
   * Handle going to the previous page in the index.
   * @return {Number} The selected index
   */
  prev: function () {
    PagesBehavior._log('prev', this.selected);
    if (this.selected <= 0) {
      return this.current();
    } else {
      return this.selected--;
    }
  },
  /**
   * Selects the previous item. (alias for prev())
   * @return {Number} The selected index
   */
  selectPrevious: function () {
    return this.prev();
  },

  /**
   * Selects the next item. (alias for next())
   * @return {Number} The selected index
   */
  selectNext: function () {
    return this.next();
  },

  /**
   * Handles getting the current page in the stack.
   * @return {Object} Page element object
   */
  getCurrent: function () {
    return this._PageList.indexOf[this.selected];
  },

  /**
   * Handles navigating back in the page stack.
   * @return {Number} The selected index
   */
  back: function () {
    PagesBehavior._log('back', this.selected);
    return this.selected--;
  },


  /**
   * Handle setting the height of the current page to the height of the container.
   */
  _fixHeight: function () {
    var pHeight = this.offsetHeight;
    var pageHeight = this.selectedPage.offsetHeight;
    var pageContent = this.querySelector('.page-content');
    var contentHeight = pageContent.offsetHeight;
    pageContent.css('height', pageHeight + 'px');
    PagesBehavior._log('Parent', pHeight, 'Child', pageHeight, 'Content', contentHeight,
      pageContent);
    return pageContent;
  },
  /**
   * Handle returning the current content pages.
   * @returns {Array} Array of content pages.
   */
  getPages: function () {
    return this.queryAllEffectiveChildren('px-page');
  }
};
