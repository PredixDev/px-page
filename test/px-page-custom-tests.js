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
    test('current page does not have .next or .previous class', function () {
      var page = document.getElementById('page1');
      assert.ok(page.classList.contains('current'));
      assert.ok(!page.classList.contains('previous'));
      assert.ok(!page.classList.contains('next'));
    });
    test('has main page', function () {
      assert.equal(element.getSelectedPage().main, true);
    });
    test('main page - should not show back button', function () {
      assert.equal(element.getSelectedPage().navbar.back, false);
    });
    suite('Back', function () {
      test('back() - changes to prev page', function () {
        element.reset(); //page1

        element.next();
        element.back();
        assert.equal(element.getSelectedPage().id, 'page1');
      });

    });
    suite('Methods', function () {
      test('goto() - changes to page by id', function () {
        assert.equal(element.goto('page3').id, 'page3');
      });
      test('goto() - changes to page by index', function () {
        assert(element.goto(3));
        assert.equal(element.getSelectedPage().id, 'page4');
      });
      test('goto() - returns false if page #id not in index', function () {
        assert.equal(element.goto('page100'), false);
      });
      test('goto() - returns false if page not in index', function () {
        assert.equal(element.goto(99), false);
      });
      test('gotoIndex() - changes to page by index', function () {
        assert.equal(element.gotoIndex(3).id, 'page4');
      });
      test('gotoIndex() - returns false if index does not exist', function () {
        assert.equal(element.gotoIndex(99), false);
      });
      test('gotoPage(id) - changes to page by #id', function () {
        assert.equal(element.gotoPage('page3').id, 'page3');
      });
      test('gotoPage(id) - returns false if page by #id does not exist', function () {
        assert.equal(element.gotoPage('page99'), false);
      });
      test('selectNext() - changes to next page', function () {
        element.reset();
        element.selectNext();
        assert.equal(element.getSelectedPage().id, 'page2');
      });
      test('selectPrevious() - changes to prev page', function () {
        element.reset(); //page1
        element.selectNext(); //page2
        element.selectPrevious(); //page1
        assert.equal(element.getSelectedPage().id, 'page1');
      });
      test('getSelectedPage() - returns current page', function () {
        assert.equal(element.getSelectedPage(), element.selectedPage);
      });
      test('reset() - resets to main page.', function () {
        element.reset();

        assert.equal(element.getSelectedPage().main, true);
      });
      test('reset() - double resets goto main page.', function () {
        element.reset();
        element.reset();
        assert.equal(element.getSelectedPage().main, true);
      });
      test('indexOf(page) - returns page index', function () {
        assert.equal(element.indexOf(element.selectedPage), 0);
      });
      test('indexOf(page) - returns false if not in index', function () {
        assert.equal(element.indexOf({}), false);
      });
    });
    suite('Selected', function () {
      test('reset() - resets to main page', function () {
        element.reset();
        assert.equal(element.getSelectedPage().main, true);
      });
      test('selected - 0 - Changes the first current page in index', function () {
        element.selected = 0;
        assert.equal(element.getSelectedPage().id, 'page1');
      });
      test('selected - 3 - Changes the 3rd current page in index', function () {
        element.selected = 2;
        assert.equal(element.getSelectedPage().id, 'page3');
      });

      test('selected - Only 1 page can have selected at a given time.', function () {
        element.selected = 0;
        element.selected = 3;
        var nodes = document.getElementById('px_page_1').queryAllEffectiveChildren('.' + element.selectedClass);
        assert.equal(element.getSelectedPage().id, 'page4');
        assert.equal(nodes.length, 1);
      });

      test('selected - Changes the current page to index', function () {
        element.selected = 2;
        assert.equal(element.getSelectedPage().id, 'page3');
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
    test('attaches .has-navbar class', function () {
      assert.ok(document.getElementById('page1').classList.contains('has-navbar'));
    });
  });
}
