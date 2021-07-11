const Genre = require('../models/genre');
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = (req, res, next) => {
  Genre.find()
    .sort([["name", "ascending"]])
    .exec((err, list_genres) => {
      if (err) return next(err);
      res.render("genre_list", { title: "Genre List", list_genres: list_genres });
    });
};


// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel({
    genre: function(cb) {
      // Get the Genre object with the specific id
      Genre.findById(req.params.id).exec(cb);
    },
    genre_books: function(cb) {
      // Get all Book objects that have the genre ID in their genre field
      Book.find({ "genre": req.params.id }).exec(cb);
    }
  }, (err, results) => {
    if (err) return next(err);
    if (!results.genre) {
      const someError = new Error("Genre not found");
      someError.status = 404;
      return next(err);
    }
    // Successful:
    res.render("genre_detail", { title: "Genre Detail", genre: results.genre, genre_books: results.genre_books });
  });
};


// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};


// Handle Genre create on POST
  // Specifies an [array] of middleware functions which is then passed to the router function and each method is called in order
  // We use this approach because the validators are middleware functions
exports.genre_create_post = [
	// Validate and sanitize the name field
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),
  
  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data
    var genre = new Genre({ 
      name: req.body.name
    });

    if (!errors.isEmpty()) {
      // There are errors, render form again w/ sanitized values/error messages
      return res.render("genre_form", { title: "Create Genre", genre: genre, errors: errors.array() });
    }
    
    // Data from form is valid
      // Check if Genre with same name already exists (we don't want to create duplicates)
    Genre.findOne({ "name": req.body.name })
      .exec((err1, found_genre) => {
        if (err1) return next(err1);
        if (found_genre) {
          // Genre exists, redirect to its detail page
          res.redirect(found_genre.url);
        } else {
          genre.save((err2) => {
            if (err2) return next(err2);
            // Genre saved, redirect to its detail page
            res.redirect(genre.url);
          });
        }
      });
  },
];


// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
  async.parallel({
    // User can only delete a genre if there are no dependent books using it
    genre: function(cb) { Genre.findById(req.params.id).exec(cb) },
    book_list: function(cb) { Book.find({ "genre": req.params.id }).exec(cb) }
  }, (err, results) => {
    if (err) return next(err);
    return res.render("genre_delete", { title: "Delete Genre", genre: results.genre, book_list: results.book_list });
  });
};


// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
  async.parallel({
    genre: function(cb) { Genre.findById(req.params.id).exec(cb) },
    book_list: function(cb) { Book.find({ "genre": req.params.id }).exec(cb) }
  }, (err, results) => {
    if (err) return next(err);
    
    // If genre has books, then re-render the page
    if (results.book_list.length > 0) {
      return res.render("genre_delete", { title: "Delete Genre", genre: results.genre, book_list: results.book_list });
    }

    return Genre.findByIdAndRemove(req.params.id, function deleteGenre(err) {
      if (err) return next(err);
      res.redirect("/catalog/genres");
    })
  });
};


// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
	res.render("genre_form", { title: "Update Genre" });
};


// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      return res.render("genre_form", { title: "Update Genre" });
    }

    Genre.findOne({ "name": req.body.name }).exec((err1, found_genre) => {
      if (err1) return next(err1);
      if (found_genre) return res.redirect(found_genre.url);

      Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, newGenre) => {
        if (err) return next(err);
        return res.redirect(newGenre.url);
      });
    })
  }
];