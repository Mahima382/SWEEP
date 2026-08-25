const mongoose = require('mongoose');
const { Schema } = mongoose;
const { NOTIFICATION_CATEGORIES } = require('../utils/constants/notificationConstants');

const categoryPrefSchema = new Schema(
  {
    category: { type: String, enum: Object.values(NOTIFICATION_CATEGORIES), required: true },
    inApp: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    muted: { type: Boolean, default: false },
  },
  { _id: false }
);

const notificationPreferenceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    categories: { type: [categoryPrefSchema], default: [] },
  },
  { timestamps: true }
);

/**
 * Returns the stored preference for a category, or the sensible
 * defaults (everything on except email) when the user has never
 * customized that category.
 */
notificationPreferenceSchema.methods.getCategoryPref = function getCategoryPref(category) {
  return (
    this.categories.find((c) => c.category === category) || {
      category,
      inApp: true,
      push: true,
      email: false,
      muted: false,
    }
  );
};

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
