'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Timer,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Send,
} from 'lucide-react'

export default function OnlineQuizTakingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale

  const router = useRouter()

  // Questions Mock
  const questions = [
    {
      id: 1,
      category: 'Kinematics',
      points: 2,
      prompt:
        'A car accelerates uniformly from rest to a speed of 25 m/s in 8.0 seconds. What is the distance traveled by the car during this time?',
      options: ['100 meters', '100.0 m', '200 meters', '50 meters'],
    },
    {
      id: 2,
      category: 'Dynamics',
      points: 2,
      prompt:
        'According to Newton&apos;s Second Law, what happens to the acceleration of an object if the net force acting on it is doubled?',
      options: [
        'It is halved',
        'It remains unchanged',
        'It doubles',
        'It quadruples',
      ],
    },
    {
      id: 3,
      category: 'Gravitation',
      points: 3,
      prompt:
        'If the distance between two planets is doubled, what happens to the gravitational force between them?',
      options: [
        'Reduces to 1/4 of original',
        'Reduces to 1/2 of original',
        'Doubles',
        'Quadruples',
      ],
    },
  ]

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({
    0: 1,
  })
  const [timeRemaining, setTimeRemaining] = useState(34 * 60 + 12)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Live Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || isSubmitted) return
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [timeRemaining, isSubmitted])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const currentQ = questions[currentIdx]

  const handleSubmitQuiz = () => {
    setIsSubmitted(true)
    setTimeout(() => {
      router.push(`/${locale}/dashboard/quizzes`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col justify-between">
      {/* Top Fixed Bar (Stitch Screen 27 exact header) */}
      <header className="bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant flex justify-between items-center h-16 px-6 w-full sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/dashboard/quizzes`}
            className="p-1.5 rounded-md hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-on-surface">
              Physics Midterm Quiz 1
            </h1>
            <span className="text-[11px] text-on-surface-variant">
              Class 10A • Standard Time Allocation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Progress
            </span>
            <span className="text-xs font-bold text-primary">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-high px-3.5 py-1.5 rounded-full border border-outline-variant">
            <Timer className="w-4 h-4 text-red-600 animate-pulse" />
            <span className="text-xs font-bold font-mono text-red-600">
              {formatTime(timeRemaining)}
            </span>
            <span className="text-[10px] text-on-surface-variant">remaining</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex justify-center items-start pt-8 pb-32 px-4 sm:px-6">
        <div className="w-full max-w-3xl bg-surface-container-lowest rounded-xl border border-outline-variant p-6 sm:p-8 shadow-xs">
          {!isSubmitted ? (
            <>
              {/* Question Header */}
              <div className="mb-6 pb-4 border-b border-outline-variant">
                <div className="flex justify-between items-center mb-2">
                  <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded text-xs font-bold text-on-surface-variant">
                    {currentQ.category}
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant">
                    {currentQ.points} Points
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-on-surface leading-snug">
                  {currentQ.prompt}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isChecked = selectedAnswers[currentIdx] === optIdx
                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-2 border-primary bg-primary/5 text-primary shadow-2xs'
                          : 'border-outline-variant hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`quiz-q-${currentIdx}`}
                        checked={isChecked}
                        onChange={() =>
                          setSelectedAnswers({
                            ...selectedAnswers,
                            [currentIdx]: optIdx,
                          })
                        }
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-semibold">{opt}</span>
                    </label>
                  )
                })}
              </div>

              <div className="mt-8 pt-4 border-t border-outline-variant flex items-start gap-2 text-xs text-on-surface-variant">
                <AlertCircle className="w-4 h-4 text-outline shrink-0 mt-0.5" />
                <p>
                  Ensure you include units in your mental calculation before selecting.
                  Standard gravity g = 9.8 m/s² applies to all kinematics calculations.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface">
                Quiz Submitted Successfully!
              </h2>
              <p className="text-xs text-on-surface-variant">
                Your responses have been recorded and sent to your teacher for grading.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav Bar (Stitch Screen 27 exact footer) */}
      {!isSubmitted && (
        <footer className="bg-surface-container-lowest border-t border-outline-variant fixed bottom-0 left-0 w-full z-40 py-3.5 px-6 flex justify-between items-center shadow-md">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Question</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-on-surface-variant">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>

          <div className="flex gap-2">
            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors text-xs font-semibold shadow-xs"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-semibold shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
