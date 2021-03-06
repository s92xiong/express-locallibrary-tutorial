# The LocalLibrary Website

Link to live [preview](https://protected-anchorage-38936.herokuapp.com/catalog).

Node Version: v14.17.0

A tutorial to learn Express by creating a website to manage the catalog for a local library.

The purpose of the LocalLibrary website is to provide an online catalog for a small local library, where users can browse available books and manage their accounts.

## Learning Concepts:

### Section 5

The 5th section of this express tutorial taught me how to build a home page to display counts of instances of the models and a list and detail pages for the books, book instances, authors & genres. This  helped me gain the fundmanetal knowledge about controllers, managing flow control when using async operations, creating views with Pug, querying the site's databse using models, passing information to a view template, and creating and extending templates. I also gained some experience using Luxon to format dates.

### Section 6

The 6th section extends upon the previous lesson, teaching me how to work with HTML forms in Express while using Pug. I learned how to write forms to create, update, and delete documents from the site's database. More specifically I learned about the form handling process:
 1. Displaying the default form page.
 2. Receiving data submitted from a user in the form of an HTTP POST request.
 3. Validating and sanitizing data to ensure incoming requests are not malicious via express-validator.
 4. Re-displaying forms if they are invalid, populating the input fields with previous values and error messages.
 5. Performing default actions if data is valid.
 6. Redirect user to another page after successful completion.
 
Form design is also another important concept I learned in this section of the tutorial. When deleting an object, one must consider how different models in the library are related and dependent upon each other. e.g. A "Book" requires and "Author", and may have multiple "Genres". A concrete example of this is trying to delete a Book that has 1 or more book instances. In order for a Book to be successfully deteled, one must first delete all Book Instances.

Express, node, and third-party packages via npm provide everything needed to add forms to this app. In this section overall, I learned how to create forms using Pug, validate and sanitize input using express-validator, and add, delete, and modify records in the database.

### Section 7

In this section I had the opportunity to review the differences between a dev/production environment and knowing how to choose a hosting provider best suited for Node (and Express). The overall object is to learn where and how you can deploy an Express app to production.

