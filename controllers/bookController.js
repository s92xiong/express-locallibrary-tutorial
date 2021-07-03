// Import  all the models to get our counts of documents
const Book = require('../models/book');
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

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
exports.book_create_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book create GET');
};

// Handle book create on POST.
exports.book_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book create POST');
};

// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Book update POST');
};
