const Author = require("../models/author");
const async = require("async");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Export functions for each of the URLs we wish to handle (the CUD operations use forms, thus have more methods for handling form post requests)

// Display list of all Authors
exports.author_list = (req, res, next) => {
  // This method uses the model's find(), sort() and exec() functions to return all Author objects sorted by family_name in alphabetic order
  Author.find()
    .sort([["family_name", "ascending"]])
    .exec((err, list_authors) => {
      if (err) return next(err);
      res.render("author_list", { title: "Author List", author_list: list_authors });
    });
};


// Display detail page for a specific Author
exports.author_detail = (req, res, next) => {
  async.parallel({
    author: function(cb) {
      Author.findById(req.params.id).exec(cb);
    },
    authors_books: function(cb) {
      Book.find({ 'author': req.params.id },'title summary').exec(cb);
    },
  }, (err, results) => {
      if (err) return next(err);
      if (!results.author) {
          const err = new Error('Author not found');
          err.status = 404;
          return next(err);
      }
      res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
  });
};


// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {
  async.parallel({
      author: function(callback) {
          Author.findById(req.params.id)
            .exec(callback)
      },
      authors_books: function(callback) {
        Book.find({ 'author': req.params.id },'title summary')
        .exec(callback)
      },
  }, function(err, results) {
      if (err) { return next(err); } // Error in API usage.
      if (results.author==null) { // No results.
          var err = new Error('Author not found');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
  });

};


// Display Author create form on GET
exports.author_create_get = (req, res) => {
  res.render("author_form", { title: "Create Author" });
};


// Handle Author create on POST
exports.author_create_post = [
  
  // We can daisy chain validators, using withMessage() to specify the error message to display if the previous validation method fails.
  body("first_name").trim().isLength({ min: 1 }).escape().withMessage("First name must be specified.").isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
  body("family_name").trim().isLength({ min: 1 }).escape().withMessage("Family name must be specified.").isAlphanumeric().withMessage("Family name has non-alphanumeric characters."),
  
  // We can use optional() to run a subsequent validation only if a field has been entered (this allows us to validate optional fields)
  // Check that the optional date of birth is an ISO8601-compliant date (the checkFalsy flag means that we'll accept either an empty string or null as an empty value)
  // Parameters are received from the request as strings. We can use toDate() (or toBoolean()) to cast these to the proper JS types
  body("date_of_birth", "Invalid date of birth").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("date_of_death", "Invalid date of death").optional({ checkFalsy: true }).isISO8601().toDate(),
  
  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract validation errors from req
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("author_form", { title: "Create Author", author: req.body, errors: errors.array() });
    }

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    author.save((err) => {
      if (err) return next(err);
      res.redirect(author.url);
    });
  }
];


// Display Author delete form on GET
exports.author_delete_get = (req, res, next) => {
  async.parallel({
    author: function(cb) { Author.findById(req.params.id).exec(cb) },
    authors_books: function(cb) { Book.find({ "author": req.params.id }).exec(cb) }
  }, (err, results) => {
    if (err) return next(err);
    // If findById() returns no results, then the author is NOT in the database (nothing to delete), therefore render the list of all authors
    if (!results.author) res.redirect("/catalog/authors");
    // Success:
    res.render("author_delete", { title: "Delete Author", author: results.author, author_books: results.authors_books });
  });
};


// Handle Author delete on POST
exports.author_delete_post = (req, res, next) => {
  async.parallel({
    // Validate that an id has been provided (this is sent via the form body parameters, rather than using the version in the URL)
    author: function(cb) { Author.findById(req.body.authorid).exec(cb) },
    authors_books: function(cb) { Book.find({ "author": req.body.authorid }).exec(cb) }
  }, (err, results) => {
    if (err) return next(err);
    if (results.authors_books.length > 0) {
      // Author has books. Render the same way as for GET route:
      return res.render("author_delete", { title: "Delete Author", author: results.author, author_books: results.authors_books });
    }

    // Author has no books. Delete object & redirect to the list of authors.
    Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
      if (err) return next(err);
      // Success - then go to author list
      res.redirect("/catalog/authors");
    });
  });
};


// Display Author update form on GET
exports.author_update_get = (req, res, next) => {
  async.parallel({
    author: function(cb) { Author.findById(req.params.id).exec(cb) }
  }, (err, results) => {
    if (err) return next(err);
    res.render("author_form", { title: "Update Author", author: results.author });
  });
};


// Handle Author update on POST
exports.author_update_post = [
  body("first_name").trim().isLength({ min: 1 }).escape().withMessage("First name must be specified.").isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
  body("family_name").trim().isLength({ min: 1 }).escape().withMessage("Family name must be specified.").isAlphanumeric().withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("date_of_death", "Invalid date of death").optional({ checkFalsy: true }).isISO8601().toDate(),

  (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.body.id
    });

    if (!errors.isEmpty()) {
      return res.render("author_form", { title: "Update Author", author: req.body, errors: errors.array() })
    }

    author.save((err) => {
      if (err) return next(err);
      res.redirect(author.url);
    });
  },
];