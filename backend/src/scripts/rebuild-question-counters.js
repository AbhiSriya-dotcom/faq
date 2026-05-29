import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Answer from '../models/answer.model.js'
import Question from '../models/question.model.js'

const apply = process.argv.includes('--apply')
const dryRun = !apply

const stats = {
  mode: dryRun ? 'dry-run' : 'apply',
  scanned: 0,
  wouldUpdate: 0,
  updated: 0,
}

function visibleAnswerFilter(questionId) {
  return {
    question_id: questionId,
    is_deleted: { $ne: true },
    visibility: { $ne: 'deleted' },
  }
}

try {
  await connectDB()

  const questions = await Question.find()
    .select('question_id answer_count has_expert_answer')
    .lean()

  for (const question of questions) {
    stats.scanned += 1

    const filter = visibleAnswerFilter(question.question_id)
    const [answerCount, expertAnswer] = await Promise.all([
      Answer.countDocuments(filter),
      Answer.exists({
        ...filter,
        $or: [
          { is_expert: true },
          { author_role: { $in: ['RESOLVER', 'ADMIN'] } },
        ],
      }),
    ])
    const nextValues = {
      answer_count: answerCount,
      has_expert_answer: Boolean(expertAnswer),
    }

    if (
      (question.answer_count || 0) === nextValues.answer_count &&
      Boolean(question.has_expert_answer) === nextValues.has_expert_answer
    ) {
      continue
    }

    if (dryRun) {
      stats.wouldUpdate += 1
      continue
    }

    await Question.updateOne(
      { question_id: question.question_id },
      { $set: nextValues },
      { runValidators: true },
    )
    stats.updated += 1
  }

  console.log(JSON.stringify(stats, null, 2))
} finally {
  await mongoose.disconnect()
}
