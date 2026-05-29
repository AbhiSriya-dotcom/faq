import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Answer from '../models/answer.model.js'
import Comment from '../models/comment.model.js'

const apply = process.argv.includes('--apply')
const dryRun = !apply

const stats = {
  mode: dryRun ? 'dry-run' : 'apply',
  answersScanned: 0,
  commentsScanned: 0,
  wouldUpdateAnswers: 0,
  updatedAnswers: 0,
  wouldUpdateComments: 0,
  updatedComments: 0,
}

function visibleCommentFilter(extra = {}) {
  return {
    ...extra,
    is_deleted: { $ne: true },
    visibility: { $ne: 'deleted' },
  }
}

try {
  await connectDB()

  const answers = await Answer.find()
    .select('answer_id comment_count top_level_comment_count')
    .lean()

  for (const answer of answers) {
    stats.answersScanned += 1

    const [commentCount, topLevelCommentCount] = await Promise.all([
      Comment.countDocuments(visibleCommentFilter({ answer_id: answer.answer_id })),
      Comment.countDocuments(
        visibleCommentFilter({
          answer_id: answer.answer_id,
          $or: [{ parent_id: null }, { parent_id: { $exists: false } }],
        }),
      ),
    ])
    const nextValues = {
      comment_count: commentCount,
      top_level_comment_count: topLevelCommentCount,
    }

    if (
      (answer.comment_count || 0) === nextValues.comment_count &&
      (answer.top_level_comment_count || 0) === nextValues.top_level_comment_count
    ) {
      continue
    }

    if (dryRun) {
      stats.wouldUpdateAnswers += 1
    } else {
      await Answer.updateOne(
        { answer_id: answer.answer_id },
        { $set: nextValues },
        { runValidators: true },
      )
      stats.updatedAnswers += 1
    }
  }

  const comments = await Comment.find().select('comment_id reply_count').lean()

  for (const comment of comments) {
    stats.commentsScanned += 1

    const replyCount = await Comment.countDocuments(
      visibleCommentFilter({ parent_id: comment.comment_id }),
    )

    if ((comment.reply_count || 0) === replyCount) {
      continue
    }

    if (dryRun) {
      stats.wouldUpdateComments += 1
    } else {
      await Comment.updateOne(
        { comment_id: comment.comment_id },
        { $set: { reply_count: replyCount } },
        { runValidators: true },
      )
      stats.updatedComments += 1
    }
  }

  console.log(JSON.stringify(stats, null, 2))
} finally {
  await mongoose.disconnect()
}
