// The schema defines an author as having String SchemaTypes for the....
  // first and family names (required, with a maximum of 100 characters), and Date fields for the dates of birth and death.

const mongoose = require("mongoose");
const { DateTime } = require("luxon");
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
  var lifetime_string = '';
  if (this.date_of_birth) {
    lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
  }
  lifetime_string += ' - ';
  if (this.date_of_death) {
    lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
  }
  return lifetime_string;
});

// Declare a virtual named "url" that returns the absolute URL required to get a particular instance of the model,
// we'll use this property in our templates whenever we need to get a link to a particular author
AuthorSchema.virtual('url').get(function () {
  return '/catalog/author/' + this._id;
});

// Virtual to format date of birth/death
AuthorSchema.virtual('years_alive').get(function () {
  if (this.date_of_death) {
    return `${DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)} - ${DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)}`;
  } else if (this.date_of_birth) {
    return DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
  } else {
    return "";
  }
});

// Compile schema into model, then export the model
module.exports = mongoose.model('Author', AuthorSchema);

