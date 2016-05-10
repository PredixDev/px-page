/**
 * Behavior that manages the px-page.
 *
 * @polymerBehavior
 */
var PageBehavior = {
  ready: function () {
    if (this.dialog) {
      this.toggleClass('dialog');
    }
    this.fire('page:ready', this);
  },
  attached: function () {
    if (this.parentNode && this.parentNode.localName === 'px-pages') {
      this.viewContainer = this.parentNode;
    }
    this._fixNavbar();
  },
  _fixContent: function () {
    var contentHeight = this.$.pageContent.offsetHeight;
    console.warn('Resize content to', contentHeight);
  },
  _fixNavbar: function () {
    //var w = this.parentNode.offsetWidth;
    //var h = this.parentNode.offsetHeight;
    var pageContent = this.$.pageContent;
    var pageNavbar = this.queryEffectiveChildren('px-navbar');
    if (pageNavbar) {
      this.toggleClass('page--has-navbar');
      //  pageContent.css('margin-top', pageNavbar.offsetHeight + 'px');
      if (this.theme) {
        pageNavbar.theme = this.theme;
      }
      if (this.title) {
        pageNavbar.title = this.title;
      }
      this.navbar = pageNavbar;
    }
  },
  show: function () {
    console.log('INFO', 'show view', this.id);
    this.toggleClass('current', false, this);
  },
  hide: function () {
    console.log('INFO', 'hide view', this.id);
    this.toggleClass('hidden', true, this);
  },
  update: function () {
    console.log('INFO', 'update view', this.id);
  },
  currentView: function () {
    console.log('INFO', 'current view', this.id);
    this.child()[0].toggleClass('current', true, this);
  },
  nextView: function () {
    console.log('INFO', 'next view', this.id);
    this.toggleClass('next', true, this);
  },
  previousView: function () {
    console.log('INFO', 'previous view', this.id);
    this.toggleClass('previous', true, this);
  },
  contextChanged: function (newContext, oldContext) {
    console.log('contextChanged', newContext, oldContext);
  },

  //I handle loading a page from a url
  _tmplChanged: function (newVal, oldVal) {
    var _this = this,
      html = '';
    if (newVal) {
      //console.log(this.id, 'Load remote html', newVal);
      this.importHref(newVal, function (e) {
        html = e.target.import.body.innerHTML;
        _this.$$('.page-content').innerHTML = html;
      }, function (err) {
        console.error('Error loading page', err);
      });
    }
  },
  open: function () {
    if (this.dialog) {
      this.toggleClass(this.currentClass);
      this.toggleClass('is-open');
    }
  },
  close: function () {
    if (this.dialog) {
      this.toggleClass('et-page-current');
      this.toggleClass('is-open');
    }
  }
};
