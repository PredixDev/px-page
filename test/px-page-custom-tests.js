// This is the wrapper for custom tests, called upon web components ready state
function runCustomTests() {
  suite('<px-pages>', function () {
    var element = document.getElementById('px_page_1');
    test('renders', function () {
      assert.ok(element);
    });
    test('attaches .px-pages__wrapper class', function () {
      assert(element.className.indexOf('px-pages__wrapper') > -1);
    });
    test('has main page', function () {
      assert.equal(element.getCurrentPage().main, true);
    });
    test('main page - should not show back button', function () {
      assert.equal(element.getCurrentPage().navbar.back, false);
    });

    suite('Back', function () {
      test('back() - changes to prev page', function () {
        element.next();
        element.back();
        assert.equal(element.getActivePage().id, 'page1');
      });

    });

    suite('Methods', function () {
      test('goto() - changes to page by id', function () {
        assert.equal(element.goto('page3').id, 'page3');
      });

      test('goto() - changes to page by index', function () {
        assert.equal(element.goto(3).id, 'page4');
      });
      test('gotoIndex() - changes to page by index', function () {
        assert.equal(element.goto(0).id, 'page1');
      });

      test('goto() - returns false if page not in index', function () {
        assert.equal(element.goto('page100'), false);
      });

      test('reset() - resets to main page', function () {
        element.reset();
        assert.equal(element.getCurrentPage().main, true);
      });

      test('next() - changes to next page', function () {
        element.next();
        assert.equal(element.getActivePage().id, 'page2');
      });

      test('prev() - changes to prev page', function () {
        element.prev();
        assert.equal(element.getActivePage().id, 'page1');
      });

      test('getCurrent() - returns current page', function () {
        assert.equal(element.getCurrentPage(), element.getCurrent());
        assert.equal(element.getCurrentPage(), element.getActivePage());
      });

      test('getCurrentPage() - returns current page', function () {
        assert.equal(element.getCurrentPage().navbar.back, false);
      });

      test('reset() - double resets goto main page.', function () {
        element.reset();
        element.reset();
        assert.equal(element.getCurrentPage().main, true);
      });

    });

    suite('Selected', function () {
      test('reset() - resets to main page', function () {
        element.reset();
        assert.equal(element.getCurrentPage().main, true);
      });

      test('selected - 0 - Changes the first current page in index', function () {
        element.selected = 0;
        assert.equal(element.getCurrentPage().id, 'page1');
      });

      test('selected - 3 - Changes the 3rd current page in index', function () {
        element.selected = 2;
        assert.equal(element.getCurrentPage().id, 'page3');
      });

      test('selected - Only 1 page can have selected at a given time.', function () {
        element.selected = 0;
        element.selected = 3;
        var nodes = document.getElementById('px_page_1').queryAllEffectiveChildren('.' + element.selectedClass);
        console.log(nodes, typeof (nodes), nodes.length);
        assert.equal(element.getCurrentPage().id, 'page4');
        assert.equal(nodes.length, 1);
      });

      test('selected - Changes the current page to index', function () {
        element.selected = 2;
        assert.equal(element.getCurrentPage().id, 'page3');
      });

    });
  });

  suite('<px-page>', function () {
    var element = document.getElementById('page1');
    test('renders', function () {
      assert.ok(element);
    });
    test('has main', function () {
      assert.ok(element.main);
    });
    test('has title', function () {
      assert.ok(element.title);
    });
    test('import - attribute loads remote HTML', function () {

      assert.ok(document.getElementById('remote-page-html'));
    });

    test('px-navbar - page stores reference to px-navbar child element', function () {
      var navbar1 = document.getElementById('page1').navbar;
      var navbar2 = document.getElementById('page1-navbar');
      assert(navbar1 === navbar2);
    });
    test('attaches .page--has-navbar class', function () {
      assert.ok(page1.className.indexOf('page--has-navbar') > -1);
    });

  });
}
