// The schema defines an author as having String SchemaTypes for the....
  // first and family names (required, with a maximum of 100 characters), and Date fields for the dates of birth and death.

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
  // In Mongoose, a virtual is a property that is not stored in MongoDB. Virtuals are typically used for computed properties on documents.
AuthorSchema.virtual('name').get(function () {
  return `${this.family_name}, ${this.first_name}`;
});

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function () {
  return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function () {
  return '/catalog/author/' + this._id;
});

AuthorSchema.virtual('due_back_formatted').get(function () {
  return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

// Creating a model - Models are created from schemas using the mongoose.model() method

// Compile schema into model, then export the model
module.exports = mongoose.model('Author', AuthorSchema);

// We've also declared a virtual for the AuthorSchema named "url" that returns the absolute URL required to get a particular instance of the model 
  // — we'll use the property in our templates whenever we need to get a link to a particular author.

