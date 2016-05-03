/**
 *
 * @type {{behaviors: *[], properties: {selected: {type: Number, reflectToAttribute: boolean, notify: boolean, observer: string, value: number}, currentPage: {type: Object, value: {}}, mainPage: {type: Object, value: {}}, context: {type: Object, value: {}}, pages: {type: Array}, PageList: {type: Array}, selectedIndex: {type: Number}, selectedClass: {type: String, value: string}, routes: {type: Object, value: {}}, inTransition: {type: String}, outTransition: {type: String}, updateHash: {type: Boolean, value: boolean}, debug: {type: Boolean, value: boolean}}, handleTrack: PagesBehavior.handleTrack, emit: PagesBehavior.emit, on: PagesBehavior.on, created: PagesBehavior.created, attached: PagesBehavior.attached, updatePage: PagesBehavior.updatePage}}
 */
var PagesBehavior = {};
PagesBehavior.properties = {
  //The default selected Page
  selected: {
    type: Number,
    reflectToAttribute: true,
    notify: true,
    observer: '_setCurrent',
    value: 0
  },
  //The current context of the Page.
  currentPage: {
    type: Object,
    value: {}
  },
  //The main page of all pages.
  mainPage: {
    type: Object,
    value: {}
  },
  /**
   * The current page's context
   */
  context: {
    type: Object,
    value: {}
  },
  //The list of pages
  pages: {
    type: Array
  },

  PageList: {
    type: Array
  },
  selectedIndex: {
    type: Number
  },
  selectedClass: {
    type: String,
    value: 'et-page-current'
  },
  //The pages routes
  routes: {
    type: Object,
    value: {}
  },
  //The in effect
  inTransition: {
    type: String
  },
  //The out effect
  outTransition: {
    type: String
  },
  //Update the URL with the current pages ID
  updateHash: {
    type: Boolean,
    value: false
  },
  //Enable debug logging
  debug: {
    type: Boolean,
    value: false
  }
};


/**
 *
 * @param page
 */
PagesBehavior.created = function (page) {
  this.PageMap = {};
  this.PageList = [];
  this.toggleClass('px-pages__wrapper');
};

/**
 *
 */
PagesBehavior.attached = function () {
  var _this = this;
  if (!this.id) {
    throw 'pages' + this.tagName + ' cannot be created without an id!';
  }
  //  this.listen(this, 'track', 'handleTrack');
  this.async(function () {
    _this._init();
    _this.toggleClass('et-wrapper');
    _this.gotoIndex(_this.selected);
  });
};

/**
 *
 * @param event
 * @param cb
 * @returns {*}
 */
PagesBehavior.on = function (event, cb) {
  return pxMobile.dom('*body').on('page:' + event, cb);
};

/**
 *
 * @param event
 * @param data
 * @returns {*}
 */
PagesBehavior.emit = function (event, data) {
  return pxMobile.dom('*body').trigger('page:' + event, data);
};

PagesBehavior.updatePage = function (page) {};

/**
 *
 * @private
 */
PagesBehavior._init = function () {
  var self = this;
  var pages = Polymer.dom(this).querySelectorAll('px-page');
  //var pages = Polymer.dom(this).getEffectiveChildren();
  var len = pages.length;
  for (var i = 0; i < len; i++) {
    //  PagesBehavior.log('page', pages[i]);
    self._addPage(pages[i]);
  }
  this.fire('px-pages-ready');
  this.fire('ready');

};
PagesBehavior.showPage = function (index) {
  this.PageList[this.selected].toggleClass('et-page-current');
  this.selected = index;
  this.PageList[this.selected].child()[0].toggleClass('et-page-current');
};
PagesBehavior.hidePage = function (index) {
  this.toggleClass('hidden', true, this);
};

//Handle adding a Page to the map
PagesBehavior._addPage = function (Page) {
  this.emit('add', Page);
  if (Page.dialog) {
    return;
  }
  if (Page.main) {
    PagesBehavior.warn('Got main page, saving', Page);
    this.mainPage = Page;
  }
  //add the index to the el
  Page.attr('index', this.PageList.length.toString());
  //push to Page list
  this.PageList.push(Page);
  //add next class to element
  Page.addClass('et-page');
  Page.addClass('next');
  //add to Page map
  this.PageMap[Page.id] = Page;
  //Add to routeHandlers
  if (Page.route) {
    this.routes[Page.route] = Page.id;
  }
};
//Handle clearing all the 'current' classes.
PagesBehavior._clearCurrent = function () {
  var _pages = Polymer.dom(this).querySelectorAll('px-page');
  if (_pages) {
    _pages.forEach(function (Page) {
      Page.removeClass('current');
    });
  }
};
/**
 */
PagesBehavior.warn = function (type, message) {
  if (this.debug) {
    console.warn('PagesBehavior.' + type, message);
  }
};

/**
 */
PagesBehavior.log = function (type, message) {
  if (this.debug) {
    console.log('PagesBehavior.' + type, message);
  }
};
/**
 * Set the current page
 */
PagesBehavior._setCurrent = function (index, oldIndex) {
  var _this = this;
  var prevPage = _this.getContentChildren()[index - 1];
  var currPage = _this.getContentChildren()[index];
  var nextPage = _this.getContentChildren()[index + 1];
  if (nextPage) {
    nextPage.addClass('next');
    nextPage.removeClass('current');
    nextPage.removeClass('et-page-current');
    nextPage.removeClass('previous');
  }
  if (prevPage) {
    prevPage.removeClass('next');
    prevPage.removeClass('current');
    prevPage.removeClass('et-page-current');
    prevPage.addClass('previous');
  }
  if (currPage) {
    currPage.removeClass('previous');
    currPage.removeClass('next');
    currPage.addClass('current');
    currPage.addClass('et-page-current');
    _this.currentPage = currPage;
    _this._updateHash();
    _this.fire('change', currPage);
  }
};
/**
 * Get the current page
 */
PagesBehavior.getCurrentPage = function () {
  return this.PageList[this.selected];
};
/**
 * Get the prev page
 */
PagesBehavior.getPrevPage = function () {
  return this.PageList[this.selected - 1];
};
/**
 * Get the next page
 */
PagesBehavior.getNextPage = function () {
  return this.PageList[this.selected + 1];
};
/**
 * Change a page
 * @param indexOrId
 */
PagesBehavior.changePage = function (indexOrId) {
  var p = null;
  this._clearCurrent();
  if (this.PageList[indexOrId]) {
    p = this.PageList[indexOrId];
    this._setCurrent(indexOrId);
  } else if (this.PageMap[indexOrId]) {
    p = this.PageMap[indexOrId];
    this._setCurrent(this.PageList.indexOf(p));
  }
  this.currentPage = p;
};


PagesBehavior.currentIndex = 0;

PagesBehavior._updateHash = function () {
  if (this.updateHash) {
    window.location.hash = this.getCurrentPage().id;
  }
};
/**
 * Reset page
 */
PagesBehavior.reset = function (selected) {
  var self = this;
  var _pages = this.getContentChildren();
  var len = _pages.length;
  for (var i = 0; i < len; i++) {
    self.log('resetting', i, _pages[i]);
    _pages[i].removeClass('et-page-current');
    _pages[i].removeClass(self.selectedClass);
    _pages[i].removeClass('current');
    _pages[i].removeClass('next');
    _pages[i].removeClass('previous');

  }

  _pages[this.selected].removeClass('next');
  this.selected = selected || 0;
  this.current();
};
/**
 * Goto a page
 */
PagesBehavior.goto = function (indexOrId) {
  var page = this.PageMap[indexOrId] || this.PageList[indexOrId] || null;
  if (page) {
    this.gotoPage(indexOrId);
    return page;
  } else {
    return false;
  }
};

/**
 * Goto a page
 */
PagesBehavior.gotoPage = function (id) {
  this.log('gotoPage', id);
  var index = 0;
  var page = this.PageMap[id];
  if (page) {
    index = this.PageList.indexOf(page);
    if (index) {
      this.selected = index;
    } else {
      this.selected = 0;
    }
  }
  return page;
};
/**
 * Goto a page by index
 * @param index
 */
PagesBehavior.gotoIndex = function (index) {
  PagesBehavior.log('gotoIndex', index);
  var _this = this;
  PagesBehavior.log('gotoIndex', index);
  var _pages = _this.getContentChildren();

  if (_pages[index]) {
    _pages[index].addClass(_this.selectedClass);
    _pages[index].removeClass('previous');
    _pages[index].removeClass('next');
    _this.selected = index;
  } else {
    _this.selected = 0;
  }
  return _this.selected;
};
/**
 * The current page
 */
PagesBehavior.current = function (index) {
  this.selected = index || this.selected;
  this.log('current', this.selected);
  return this.gotoIndex(this.selected);
};
/**
 * The next page
 */
PagesBehavior.next = function () {
  PagesBehavior.log('next', this.selected);
  if (this.selected >= this.PageList.length - 1) {
    if (this.loop) {
      return this.reset();
    }
    console.warn(this.tagName, 'end of page stack!');
    return;
  } else {
    return this.selected++;
  }
  return this.current();
};
/**
 * The previous page
 */
PagesBehavior.prev = function () {
  PagesBehavior.log('prev', this.selected);
  if (this.selected <= 0) {
    return this.current();
  } else {
    return this.selected--;
  }
};


/**
 * Remove transition from page
 * @param index
 */
PagesBehavior.removeTransition = function (index) {
  var page = this.PageList[index];
  page.content.css('transition', 'none');
};
/**
 * Do a transition
 */
PagesBehavior.doTransition = function (index) {
  var page = this.PageList[index];
  var position = page.position();
  page
    .css('transition', 'all 400ms ease')
    .css('transform', 'translate3d(' + (-1 * (position.left)) + 'px, 0, 0)');
};
/**
 * Change the page
 * @param name
 */
PagesBehavior.change = function (name) {
  return this.goto(name);
};
/**
 * Load a page
 * @param url
 */
PagesBehavior.load = function (url) {
  this.log('PagesBehavior.load', 'NOT IMPLEMENTED');
  return false;
};
/**
 * Get the active page
 * @returns {*}
 */
PagesBehavior.getActivePage = function () {
  return this.PageList[this.selected];
};
PagesBehavior.getCurrent = function () {
  return this.PageList[this.selected];
};

PagesBehavior.back = function () {
  PagesBehavior.log('back', this.selected);
  return this.selected--;
};
//PagesBehavior.currentPage = this.getActivePage();
/**
 * Add a px-page from page object
 * @param obj
 */
PagesBehavior.addPage = function (obj) {
  PagesBehavior.warn('PagesBehavior.addPage', 'NOT IMPLEMENTED');
  return false;
};
//Handle setting the height of the current page to the height of the container.
PagesBehavior._fixHeight = function () {
  var pHeight = this.offsetHeight;
  var pageHeight = this.currentPage.offsetHeight;
  var pageContent = this.querySelector('.page-content');
  var contentHeight = pageContent.offsetHeight;
  pageContent.css('height', pageHeight + 'px')
  PagesBehavior.log('Parent', pHeight, 'Child', pageHeight, 'Content', contentHeight, pageContent);
  return pageContent;
};
PagesBehavior.getPages = function () {
  var _pages = this.getContentChildren();
  return _pages;
}
