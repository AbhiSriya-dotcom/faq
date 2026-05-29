import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Answer from '../models/answer.model.js'
import Comment from '../models/comment.model.js'
import Question from '../models/question.model.js'
import Vote from '../models/vote.model.js'

const apply = process.argv.includes('--apply')
const dryRun = !apply

const targets = [
  {
    type: 'question',
    Model: Question,
    idField: 'question_id',
    fields: ['upvotes'],
  },
  {
    type: 'answer',
    Model: Answer,
    idField: 'answer_id',
    fields: ['upvotes', 'downvotes', 'score'],
  },
  {
    type: 'comment',
    Model: Comment,
    idField: 'comment_id',
    fields: ['upvotes', 'downvotes', 'score'],
  },
]

const stats = {
  mode: dryRun ? 'dry-run' : 'apply',
  scanned: 0,
  wouldUpdate: 0,
  updated: 0,
  byTargetType: {},
}

function perTargetStats(targetType) {
  stats.byTargetType[targetType] ||= {
    scanned: 0,
    wouldUpdate: 0,
    updated: 0,
  }

  return stats.byTargetType[targetType]
}

async function getVoteSummary(targetType) {
  const rows = await Vote.aggregate([
    { $match: { target_type: targetType } },
    {
      $group: {
        _id: '$target_id',
        upvotes: {
          $sum: { $cond: [{ $eq: ['$value', 1] }, 1, 0] },
        },
        downvotes: {
          $sum: { $cond: [{ $eq: ['$value', -1] }, 1, 0] },
        },
      },
    },
  ])

  return new Map(
    rows.map((row) => [
      row._id,
      {
        upvotes: row.upvotes || 0,
        downvotes: row.downvotes || 0,
        score: (row.upvotes || 0) - (row.downvotes || 0),
      },
    ]),
  )
}

function needsUpdate(document, nextValues, fields) {
  return fields.some((field) => (document[field] || 0) !== nextValues[field])
}

try {
  await connectDB()

  for (const target of targets) {
    const targetStats = perTargetStats(target.type)
    const summaries = await getVoteSummary(target.type)
    const selectFields = [target.idField, ...target.fields].join(' ')
    const documents = await target.Model.find().select(selectFields).lean()

    for (const document of documents) {
      stats.scanned += 1
      targetStats.scanned += 1

      const id = document[target.idField]
      const summary = summaries.get(id) || { upvotes: 0, downvotes: 0, score: 0 }
      const nextValues = Object.fromEntries(
        target.fields.map((field) => [field, summary[field] || 0]),
      )

      if (!needsUpdate(document, nextValues, target.fields)) {
        continue
      }

      if (dryRun) {
        stats.wouldUpdate += 1
        targetStats.wouldUpdate += 1
        continue
      }

      await target.Model.updateOne(
        { [target.idField]: id },
        { $set: nextValues },
        { runValidators: true },
      )
      stats.updated += 1
      targetStats.updated += 1
    }
  }

  console.log(JSON.stringify(stats, null, 2))
} finally {
  await mongoose.disconnect()
}
