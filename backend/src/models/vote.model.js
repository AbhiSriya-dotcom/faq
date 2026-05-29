import { randomUUID } from 'node:crypto'
import mongoose from 'mongoose'

/**
 * votes
 *
 * Source of truth for upvotes/downvotes across questions, answers, and comments.
 * Source of truth for who voted and for rebuilding vote counters.
 * Cached `upvotes`, `downvotes`, and `score` fields on target documents are
 * display caches owned by vote controllers/services and rebuild scripts only.
 *
 *   value:  1 = upvote
 *   value: -1 = downvote
 *
 * Flipping a vote = update this doc's `value` + adjust target's counters.
 * Removing a vote = delete this doc + adjust target's counters.
 */

const voteSchema = new mongoose.Schema(
  {
    vote_id: {
      type: String,
      default: randomUUID,
      immutable: true,
      unique: true,
      index: true,
    },

    user_id: {
      type: String,
      required: true,
    },

    target_type: {
      type: String,
      enum: ['question', 'answer', 'comment'],
      required: true,
    },

    // The question_id / answer_id / comment_id of the target document.
    target_id: {
      type: String,
      required: true,
    },

    value: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  {
    collection: 'votes',
    timestamps: { createdAt: 'created_at', updatedAt: false },
  },
)

// One vote per user per target. Enforce at DB level.
voteSchema.index({ user_id: 1, target_type: 1, target_id: 1 }, { unique: true })

// "Show me everything this user voted on" (profile / audit views).
voteSchema.index({ user_id: 1, created_at: -1 })

// Rebuild a target's counters from scratch.
voteSchema.index({ target_type: 1, target_id: 1 })
voteSchema.index({ target_type: 1, target_id: 1, value: 1 })

export default mongoose.model('Vote', voteSchema)
