/**
 * Illini Bookstore Textbook Scraper
 * http://www.bookstore.illinois.edu/textbooks/buy_courselisting.asp
 * Use developer tools console and paste the code below
 */

var campusId = 235;
//var termId = 394; // Spring 2017
var termId = 389; // Fall 2016

// Batch settings so we do not get banned by the bookstore
// for sending too many requests in a short amount of time
var batchSize = 5; // number of departments
var iteration = 0;
var frequency = 10000; // milliseconds

var imgSrcReplacement = 'no_load_src';

var addBookInfo = function($root, selector, splitValue, book, key) {
  let $element = $root.find(selector);

  if ($element.length) {
    let value = $element.text();

    if (splitValue) {
      let valueArray = value.split('\xa0');
      if (valueArray.length >= 2) {
        value = valueArray[1];
      }
    }

    if (value) {
      book[key] = value;
    }
  }
}

var addBookImage = function($root, book) {
  let $element = $root.find('td.book-cover img');

  if ($element.length) {
    let value = 'http://www.bookstore.illinois.edu/textbooks/' + $element.get(0).attributes.getNamedItem(imgSrcReplacement).value;
    book['image'] = value;
  }
}

var processBooks = function(course, section, htmlText) {
  // Replace img src attribute so the images are not loaded automatically
  htmlText = htmlText.replace(/img src/g, 'img ' + imgSrcReplacement);

  // Parse HTML text into DOM elements
  var wrapper = document.createElement('div');
  wrapper.innerHTML = htmlText;

  // Loop through each book
  $(wrapper).find('#section-' + section.id + ' tr.book').each(function() {
    let $isbnElement = $(this).find('span.isbn');

    // We assume those without ISBN are not books (for examples: clicker, binder)
    if ($isbnElement.length) {
      let isbn = isbn_expand($isbnElement.text());

      let book = {
        isbn: isbn,
        courses: course.name
      };

      addBookInfo($(this), 'span.book-title', false, book, 'title');
      addBookInfo($(this), 'span.book-author', false, book, 'authors');
      addBookInfo($(this), 'span.book-copyright', true, book, 'copyrightYear');
      addBookInfo($(this), 'span.book-publisher', true, book, 'publisher');
      addBookInfo($(this), 'span.book-edition', true, book, 'edition');
      addBookInfo($(this), 'span.book-binding', true, book, 'binding');
      addBookImage($(this), book);

      // Format year
      if (book.copyrightYear && book.copyrightYear.length === 2) {
        book.copyrightYear = '20' + book.copyrightYear;
      }

      // Call Books API
      $.ajax({
        url: 'http://fa16-cs498rk-037.cs.illinois.edu:3000/api/books',
        type: 'POST',
        async: false,
        data: book,
        dataType: 'json',
        error: function(xmlHttpReq) {
          if (xmlHttpReq.status !== 304) {
            console.log('Error in calling Books API');
            console.log(book);
            console.log(xmlHttpReq.response);
          }
        }
      });
    }
  });
}

var getBooks = function(course, section) {
  $.ajax({
    url: 'textbooks_xml.asp?control=section&section=' + section.id,
    method: 'GET',
    async: false,
    success: function(response) {
      processBooks(course, section, response);
    },
    error: function(err) {
      // Can't figure out why jQuery fires error event when the request returns a good response
      if (err.status === 200 && err.response.length > 0) {
        processBooks(course, section, err.response);
      }
      else {
        console.log('Error in getBooks!');
        console.log(course);
        console.log(section);
        console.log(err)
      };
    }
  });
};

var getSections = function(course) {
  $.ajax({
    url: 'textbooks_xml.asp?control=course&course=' + course.id + '&term=' + termId,
    method: 'GET',
    datatype: 'xml',
    async: false,
    success: function(xml) {
      let sections = xml.documentElement.childNodes;
      let i;

      for (i = 0; i < sections.length; i++) {
        let section = {
          id: sections[i].getAttribute('id'),
          name: sections[i].getAttribute('name'),
          instructor: sections[i].getAttribute('instructor')
        };

        getBooks(course, section);
      }
    },
    error: function(err) {
      console.log('Error in getSections!');
      console.log(course);
      console.log(err);
    }
  });
};

var getCourses = function(department) {
  $.ajax({
    url: 'textbooks_xml.asp?control=department&dept=' + department.id + '&term=' + termId,
    method: 'GET',
    datatype: 'xml',
    async: false,
    success: function(xml) {
      let courses = xml.documentElement.childNodes;
      let i;

      for (i = 0; i < courses.length; i++) {
        let course = {
          id: courses[i].getAttribute('id'),
          number: courses[i].getAttribute('name')
        };
        course.name = department.code + ' ' + course.number;

        getSections(course);
      }
    },
    error: function(err) {
      console.log('Error in getCourses!');
      console.log(department);
      console.log(err);
    }
  });
};

var getDepartments = function() {
  $.ajax({
    url: 'textbooks_xml.asp?control=campus&campus=' + campusId + '&term=' + termId,
    method: 'GET',
    dataType: 'xml',
    async: false,
    success: function(xml) {
      let departments = xml.documentElement.childNodes;
      let i;
      let batchCount = 0;

      for (i = 0; i < departments.length; i++) {
        let department = {
          id: departments[i].getAttribute('id'),
          code: departments[i].getAttribute('abrev'),
          name: departments[i].getAttribute('name')
        };

        if (department.code !== 'DROP') {
          setTimeout(function() {
            getCourses(department);
          }, iteration * frequency);

          batchCount++;
          if (batchCount >= batchSize) {
            iteration++;
            batchCount = 0;
          }
        }
      }
    },
    error: function(err) {
      console.log('Error in getDepartments!');
      console.log(err);
    }
  });
};

getDepartments();

setTimeout(function() {
  console.log('Scrapping completed');
}, (iteration + 1) * frequency);
