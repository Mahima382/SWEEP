const mongoose = require('mongoose');
const { Schema } = mongoose;

const pushTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['ios', 'android', 'web'], required: true },
    isValid: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/**
 * Edge case: push token invalid because the user reinstalled the app.
 * We mark it invalid instead of deleting so PushChannel silently stops
 * using it — the notification itself remains available in the in-app
 * inbox regardless (FR-09 failure case).
 */
pushTokenSchema.statics.invalidateToken = function invalidateToken(token) {
  return this.updateOne({ token }, { $set: { isValid: false } });
};

module.exports = mongoose.model('PushToken', pushTokenSchema);
