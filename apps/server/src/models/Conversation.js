import mongoose, { Schema } from 'mongoose';

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

conversationSchema.statics.findByParticipants = async function (userId1, userId2) {
  return await this.findOne({
    participants: { $all: [userId1, userId2] },
  }).populate('participants', 'username email isOnline lastSeen');
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;

