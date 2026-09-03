'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Send,
  Eye,
  HelpCircle,
} from 'lucide-react'

interface QuestionDraft {
  id: string
  prompt: string
  points: number
  options: string[]
  correctIndex: number
}

export default function QuizBuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState('en')
  params.then((p) => setLocale(p.locale))

  const [title, setTitle] = useState('Midterm Assessment: Cellular Biology')
  const [subject, setSubject] = useState('bio')
  const [category, setCategory] = useState('summative')
  const [timeLimit, setTimeLimit] = useState(45)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q-1',
      prompt: 'Which organelle is known as the powerhouse of the cell?',
      points: 2,
      options: ['Mitochondria', 'Endoplasmic Reticulum', 'Golgi Apparatus', 'Nucleus'],
      correctIndex: 0,
    },
    {
      id: 'q-2',
      prompt: 'During which phase of mitosis do chromosomes align at the equatorial plane?',
      points: 2,
      options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
      correctIndex: 1,
    },
  ])

  const handleAddQuestion = () => {
    const newQ: QuestionDraft = {
      id: `q-${Date.now()}`,
      prompt: '',
      points: 2,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
    }
    setQuestions([...questions, newQ])
  }

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) return
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    setToastMessage('Quiz published successfully to student portal!')
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs Navigation with mobile horizontal scroll */}
      <nav className="flex items-center text-xs font-semibold text-on-surface-variant gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
        <Link
          href={`/${locale}/dashboard/quizzes`}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quizzes &amp; Assessments</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-on-surface font-bold">Quiz Builder</span>
      </nav>

      {/* Header (Stitch Screen 25 exact header) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Quiz Builder
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Compose and configure online assessments for your students.
          </p>
        </div>

        <button
          onClick={() => alert('Previewing quiz student view...')}
          className="px-4 py-2 border border-outline-variant bg-surface-container-low text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>
      </div>

      <form onSubmit={handlePublish} className="space-y-6">
        {/* Quiz Metadata Card (Stitch Screen 25) */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Quiz Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Assessment: Cellular Biology"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="bio">Biology</option>
                <option value="chem">Chemistry</option>
                <option value="phys">Physics</option>
                <option value="math">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Grade Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="summative">Summative Assessment</option>
                <option value="formative">Formative Assessment</option>
                <option value="homework">Homework Quiz</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Question Builder Area */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Questions
            </h2>
            <span className="text-xs font-bold bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-full">
              Total: {questions.length}
            </span>
          </div>

          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs space-y-4 relative"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                  Question {idx + 1}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-semibold">
                    <span>Points:</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={q.points}
                      onChange={(e) => {
                        const pts = Number(e.target.value)
                        setQuestions(
                          questions.map((item) =>
                            item.id === q.id ? { ...item, points: pts } : item
                          )
                        )
                      }}
                      className="w-14 px-2 py-0.5 bg-surface-container-low border border-outline-variant rounded text-center text-xs font-bold text-on-surface"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-1.5 text-outline hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Question Prompt
                </label>
                <input
                  type="text"
                  required
                  value={q.prompt}
                  onChange={(e) => {
                    const val = e.target.value
                    setQuestions(
                      questions.map((item) =>
                        item.id === q.id ? { ...item, prompt: val } : item
                      )
                    )
                  }}
                  placeholder="Type the question prompt here..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Options (Select the correct radio button)
                </label>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctIndex === optIdx}
                      onChange={() => {
                        setQuestions(
                          questions.map((item) =>
                            item.id === q.id ? { ...item, correctIndex: optIdx } : item
                          )
                        )
                      }}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...q.options]
                        newOpts[optIdx] = e.target.value
                        setQuestions(
                          questions.map((item) =>
                            item.id === q.id ? { ...item, options: newOpts } : item
                          )
                        )
                      }}
                      className="flex-1 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-3 border-2 border-dashed border-outline-variant hover:border-primary rounded-xl text-xs font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
          <button
            type="button"
            onClick={() => {
              setToastMessage('Draft saved successfully.')
              setTimeout(() => setToastMessage(null), 2500)
            }}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Quiz</span>
          </button>
        </div>
      </form>
    </div>
  )
}
