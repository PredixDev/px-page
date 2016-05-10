/**
 * Behavior that manages the px-pages.
 *
 * @polymerBehavior
 * @type {{behaviors: *[], properties: {selected: {type: Number, reflectToAttribute: boolean, notify: boolean, observer: string, value: number}, currentPage: {type: Object, value: {}}, mainPage: {type: Object, value: {}}, context: {type: Object, value: {}}, pages: {type: Array}, _PageList: {type: Array}, selectedIndex: {type: Number}, selectedClass: {type: String, value: string}, routes: {type: Object, value: {}}, inTransition: {type: String}, outTransition: {type: String}, updateHash: {type: Boolean, value: boolean}, debug: {type: Boolean, value: boolean}}, handleTrack: PagesBehavior.handleTrack, emit: PagesBehavior.emit, on: PagesBehavior.on, created: PagesBehavior.created, attached: PagesBehavior.attached, updatePage: PagesBehavior.updatePage}}
 */

var PagesBehavior = {
  properties: {

    //The default selected index
    selected: {
      type: Number,
      reflectToAttribute: true,
      notify: true,
      observer: '_setCurrent',
      value: 0
    },

    //The current active page object
    currentPage: {
      type: Object
    },

    //The main page
    mainPage: {
      type: Object
    },

    //The array of indexed pages
    pages: {
      type: Array
    },

    _PageList: {
      type: Array
    },

    //The selected page's index
    selectedIndex: {
      type: Number
    },

    //The selected page's class name
    selectedClass: {
      type: String,
      value: 'current'
    },

    //Update the URL with the current page #id attribute
    updateHash: {
      type: Boolean,
      value: false
    },

    //Enable debug logging
    debug: {
      type: Boolean,
      value: false
    }
  },
  _init: function () {
    var self = this;
    var pages = this.queryAllEffectiveChildren('px-page');
    var len = pages.length;
    for (var i = 0; i < len; i++) {
      PagesBehavior.log('page', pages[i]);
      self._addPage(pages[i]);
    }
    this.fire('ready');
  },
  created: function () {
    this.PageMap = {};
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
      _this.log('nextPage', nextPage);
      _this.toggleClass('next', true, nextPage);
      //  nextPage.toggleClass(_this.selectedClass, false);
      _this.toggleClass('previous', false, nextPage);
    }
    if (prevPage) {
      _this.log('prevPage', prevPage);
      _this.toggleClass('next', false, prevPage);
      //  prevPage.toggleClass(_this.selectedClass, false);
      _this.toggleClass('previous', true, prevPage);
    }
    if (currPage) {
      _this.log('currPage', _this.selectedClass, currPage);
      currPage.nextPage = nextPage;
      currPage.prevPage = prevPage;
      _this.toggleClass('next', false, currPage);
      _this.toggleClass('previous', false, currPage);
      _this.toggleClass(_this.selectedClass, true, currPage);
      _this.currentPage = currPage;
    }
    _this._updateHash();
    _this.fire('change', currPage);
  },
  /**
   * Goto a page by index or id
   */
  goto: function (indexOrId) {
    var page = this.PageMap[indexOrId] || this._PageList[indexOrId] || null;
    if (page) {
      this.gotoPage(indexOrId);
      return page;
    } else {
      return false;
    }
  },
  //Handle adding a Page to the map
  _addPage: function (Page) {
    this.fire('add', Page);
    if (Page.dialog) {
      return;
    }
    if (Page.main) {
      Page.toggleClass(this.selectedClass, true);
      PagesBehavior.warn('Got main page, saving', Page);
      this.mainPage = Page;
    }
    //add the index to the el
    Page.setAttribute('index', this._PageList.length.toString());

    //push to Page list
    this._PageList.push(Page);

    //add next class to element
    Page.toggleClass('et-page');
    Page.toggleClass('next');

    //add to Page map
    this.PageMap[Page.id] = Page;
    //Add to routeHandlers
    if (Page.route) {
      this.routes[Page.route] = Page.id;
    }
  },
  /**
   * Reset page
   */
  reset: function (selected) {
    var self = this;
    var _pages = this.queryAllEffectiveChildren('px-page');
    var len = _pages.length;
    this._clearCurrent();
    for (var i = 0; i < len; i++) {
      self.log('resetting', i, _pages[i]);
      _pages[i].toggleClass(self.selectedClass);
      _pages[i].toggleClass('next');
      _pages[i].toggleClass('previous');
    }
    _pages[this.selected].toggleClass(self.selectedClass);
    this.selected = selected || 0;

  },
  /**
   * Goto a page by index
   */
  gotoIndex: function (index) {
    PagesBehavior.log('gotoIndex', index);
    var _this = this;
    PagesBehavior.log('gotoIndex', index);
    var _pages = _this.getContentChildren();

    if (_pages[index]) {
      _pages[index].toggleClass(_this.selectedClass, false);
      _pages[index].toggleClass('previous', false);
      _pages[index].toggleClass('next', false);
      _this.selected = index;
    } else {
      _this.selected = 0;
    }
    return _this.selected;
  },

  /**
   * Goto a page by #id
   */
  gotoPage: function (id) {
    this.log('gotoPage', id);
    var index = 0;
    var page = this.PageMap[id];
    if (page) {
      index = this._PageList.indexOf(page);
      if (index) {
        this.selected = index;
      } else {
        this.selected = 0;
      }
    }
    return page;
  },

  showPage: function (index) {
    this.log('showPage', index);
    this._PageList[this.selected].toggleClass(this.selectedClass);
    this.selected = index;
    this._PageList[this.selected].child()[0].toggleClass(this.selectedClass);
  },
  hidePage: function (index) {
    this.toggleClass('hidden', true, this);
  },

  warn: function (type, message) {
    if (this.debug) {
      console.warn('PagesBehavior.' + type, message);
    }
  },
  log: function (type, message) {
    if (this.debug) {
      console.log('PagesBehavior.' + type, message);
    }
  },
  //Clears the current page
  _clearCurrent: function () {
    var self = this;
    var _pages = this.queryAllEffectiveChildren('px-page');
    if (_pages) {
      for (var i = 0; i < _pages.length; i++) {
        console.log('_clearCurrent', self.selectedClass, _pages[i]);
        self.toggleClass(self.selectedClass, false, _pages[i]);
      }
    }
  },

  /**
   * Get the current page
   */
  getCurrentPage: function () {
    return this._PageList[this.selected];
  },
  /**
   * Get the prev page
   */
  getPrevPage: function () {
    return this._PageList[this.selected - 1];
  },
  /**
   * Get the next page
   */
  getNextPage: function () {
    return this._PageList[this.selected + 1];
  },
  /**
   * Change a page
   * @param indexOrId
   */
  changePage: function (indexOrId) {
    var p = null;
    this._clearCurrent();
    if (this._PageList[indexOrId]) {
      p = this._PageList[indexOrId];
      this._setCurrent(indexOrId);
    } else if (this.PageMap[indexOrId]) {
      p = this.PageMap[indexOrId];
      this._setCurrent(this._PageList.indexOf(p));
    }
    this.currentPage = p;
  },


  _updateHash: function () {
    if (this.updateHash) {
      window.location.hash = this.getCurrentPage().id;
    }
  },


  /**
   * The current page
   */
  current: function (index) {
    this.selected = index || this.selected;
    this.log('current', this.selected);
    return this.gotoIndex(this.selected);
  },
  /**
   * The next page
   */
  next: function () {
    PagesBehavior.log('next', this.selected);
    if (this.selected >= this._PageList.length - 1) {
      if (this.loop) {
        return this.reset();
      }
      console.warn(this.tagName, 'end of page stack!');
      return;
    } else {
      return this.selected++;
    }
    return this.current();
  },
  /**
   * The previous page
   */
  prev: function () {
    PagesBehavior.log('prev', this.selected);
    if (this.selected <= 0) {
      return this.current();
    } else {
      return this.selected--;
    }
  },
  /**
   * Remove transition from page
   * @param index
   */
  removeTransition: function (index) {
    var page = this._PageList[index];
    page.content.css('transition', 'none');
  },
  /**
   * Do a transition
   */
  doTransition: function (index) {
    var page = this._PageList[index];
    var position = page.position();
    page
      .css('transition', 'all 400ms ease')
      .css('transform', 'translate3d(' + (-1 * (position.left)) + 'px, 0, 0)');
  },
  /**
   * Change the page by name.
   * @param name
   */
  change: function (name) {
    return this.goto(name);
  },
  /**
   * Load a page
   * @param url
   */
  load: function (url) {
    throw new Error('NOT IMPLEMENTED');
    return false;
  },
  /**
   * Get the active page
   */
  getActivePage: function () {
    return this._PageList[this.selected];
  },
  /**
   * Handles getting the current page in the stack.
   */
  getCurrent: function () {
    return this._PageList[this.selected];
  },
  /**
   * Handles navigating back in the page stack.
   */
  back: function () {
    PagesBehavior.log('back', this.selected);
    return this.selected--;
  },
  /**
   * Add a px-page from page object
   * @param obj
   */
  addPage: function (obj) {
    throw new Error('NOT IMPLEMENTED');
    return false;
  },

  /**
   * Handle setting the height of the current page to the height of the container.
   */
  _fixHeight: function () {
    var pHeight = this.offsetHeight;
    var pageHeight = this.currentPage.offsetHeight;
    var pageContent = this.querySelector('.page-content');
    var contentHeight = pageContent.offsetHeight;
    pageContent.css('height', pageHeight + 'px');
    PagesBehavior.log('Parent', pHeight, 'Child', pageHeight, 'Content', contentHeight, pageContent);
    return pageContent;
  },
  getPages: function () {
    var _pages = this.getContentChildren();
    return _pages;
  }
};
