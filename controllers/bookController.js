// Import  all the models to get our counts of documents
const Book = require('../models/book');
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");

// Import the async module
const async = require("async");

exports.index = (req, res, next) => {
  async.parallel({
    book_count: function(callback) {
      Book.countDocuments({}, callback);
    },
    book_instance_count: function(callback) {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count: function(callback) {
      BookInstance.countDocuments({ status: "Available" }, callback);
    },
    author_count: function(callback) {
      Author.countDocuments({}, callback);
    },
    genre_count: function(callback) {
      Genre.countDocuments({}, callback);
    }
  }, function(err, results) {
    res.render("index", { title: "Local Library Home", error: err, data: results });
  });
};


// Display list of all books.
  // Get a list of all Book objects in the database then pass these to the template for rendering
  // Return only the title and author (we don't need the other fields)
  // Call populate() on Book, specifying the author field—-this will replace the stored book author id with the full author details
exports.book_list = (req, res, next) => {
  Book.find({}, "title author")
    .populate("author")
    .exec((err, list_books) => {
      if (err) return next(err);
      res.render("book_list", { title: "Book List", book_list: list_books });
    });
};


// Display detail page for a specific book.
exports.book_detail = (req, res, next) => {
  async.parallel({
    book: function(cb) {
      Book.findById(req.params.id)
        .populate("author")
        .populate("genre")
        .exec(cb);
    },
    book_instance: function(cb) {
      BookInstance.find({ "book": req.params.id }).exec(cb);
    }
  }, (err, results) => {
    if (err) return next(err);
    if (!results.book) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    res.render("book_detail", { title: results.book.title, book: results.book, book_instances: results.book_instance });
  });
};


// Display book create form on GET.
exports.book_create_get = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book
  async.parallel({
    authors: function(cb) { Author.find(cb) },
    genres: function(cb) { Genre.find(cb) }
  }, (err, results) => {
    if (err) return next(err);
    res.render("book_form", { title: "Create Book", authors: results.authors, genres: results.genres});
  });
};


// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    return next();
  },
  // Validate and Sanitize the fields
  body("title", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("author", "Author must not be empty").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary must not be empty").trim().isLength({ min: 1 }).escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(), // Use the wildcard (*) in the sanitiser to individually validate each of the genre array entries

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a Book object w/ escaped and trimmed data
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre
    });

    if (!errors.isEmpty()) {
      // If errors exist, re-render form w/ sanitized values/error messages + get all authors & genres for the form
      async.parallel({
        authors: function(cb) { Author.find(cb) },
        genres: function(cb) { Genre.find(cb) }
      }, (err, results) => {
        if (err) return next(err);
        
        // Mark our selected genres as checked by the user
        // Iterate through all the genres and add the checked='true' parameter to those that were in our post data
        for (let i = 0; i <  results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = "true";
          }
        }
        res.render("book_form", { title: "Create Book", authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
      });
      return;
    }
    book.save(err => err ? next(err) : res.redirect(book.url));
  }
];


// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
};


// Handle book delete on POST.
exports.book_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
};


// Display book update form on GET.
exports.book_update_get = (req, res, next) => {
  // Get book, authors and genres for the form
  async.parallel({
    // Get id of the Book to be updated from the URL parameter (req.params.id)
    book: function(cb) { Book.findById(req.params.id).populate("author").populate("genre").exec(cb) },
    authors: function(cb) { Author.find(cb) },
    genres: function(cb) { Genre.find(cb) } 
  }, (err, results) => {
    if (err) return next(err);
    // Not finding any book results is not an error for a search — but it is for this application because we know there must be a matching book record!
    if (!results.book) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    // Success
    // Mark our selected genres as checked: (for every genre, we want to iterate through all of the book's genres)
    for (let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
      for (let book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
        if (results.genres[all_g_iter]._id.toString() === results.book.genre[book_g_iter]._id.toString()) {
          results.genres[all_g_iter].checked = "true";
        }
      }
    }
    return res.render("book_form", { title: "Update Book", authors: results.authors, genres: results.genres, book: results.book });
  });
};


// Handle book update on POST.
exports.book_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    return next();
  },

  // Validate and sanitise the fields
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  // Process request after validation & sanitization
  (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);

    // Create a Book object w/ escaped/trimmed data and old id
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
      _id: req.params.id // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // Errors exist, render form again w/ sanitized values/error messages

      // Get all authors & genres for the form
      async.parallel({
        authors: function(cb) { Author.find(cb); },
        genres: function(cb) { Genre.find(cb) }
      }, (err, results) => {
        if (err) return next(err);

        // Mark our selected genres as checked
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = "true";
          }
        }
        return res.render("book_form", { title: "Update Book", authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
      });
    }

    // Book data form is valid, update the record:
    Book.findByIdAndUpdate(req.params.id, book, {}, (err, thebook) => {
      if (err) return next(err);
      return res.redirect(thebook.url);
    });
  },
];
