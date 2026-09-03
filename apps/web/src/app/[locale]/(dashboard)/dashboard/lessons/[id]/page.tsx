'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  Download,
  ArrowRight,
} from 'lucide-react'

export default function LessonDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale

  const [isCompleted, setIsCompleted] = useState(false)

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Breadcrumbs & Completion Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex items-center text-xs font-semibold text-on-surface-variant gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          <Link
            href={`/${locale}/dashboard/lessons`}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lessons &amp; Planner</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <span>Physics 101</span>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <span className="text-on-surface font-bold">Lesson 4</span>
        </nav>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-outline" />
            <span>Est. Time: 45 min</span>
          </span>

          <button
            onClick={() => setIsCompleted(!isCompleted)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${
                isCompleted ? 'text-emerald-600' : 'text-outline'
              }`}
            />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="border-b border-outline-variant pb-6">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
          Circular Motion &amp; Gravitation
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-3xl leading-relaxed">
          Understand the mechanics of objects moving in circular paths and the fundamental
          principles of universal gravitation driving planetary motion.
        </p>
      </div>

      {/* Main Grid: Content (2 cols) & Resources Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Article Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Uniform Circular Motion */}
          <section className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 border border-outline-variant shadow-xs">
            <h2 className="text-lg font-bold text-on-surface mb-3">
              1. Uniform Circular Motion
            </h2>
            <div className="text-xs text-on-surface-variant leading-relaxed space-y-3">
              <p>
                An object moving in a circle of radius <em>r</em> with a constant speed <em>v</em>{' '}
                is said to be in uniform circular motion. Even though the speed is constant,
                the velocity vector is constantly changing direction, which means the object is accelerating.
              </p>

              <div className="my-4 p-4 bg-surface-container-low rounded-lg border-l-4 border-primary">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Centripetal Acceleration
                </h3>
                <p className="mb-2">The acceleration points towards the center of the circle and is given by:</p>
                <div className="text-center font-mono font-bold text-lg text-primary py-1">
                  a<sub>c</sub> = v<sup>2</sup> / r
                </div>
              </div>

              <p>
                According to Newton&apos;s Second Law, this acceleration requires a net force directed
                toward the center, known as the centripetal force (<em>F<sub>c</sub></em>).
              </p>
            </div>
          </section>

          {/* Section 2: Universal Gravitation */}
          <section className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 border border-outline-variant shadow-xs">
            <h2 className="text-lg font-bold text-on-surface mb-3">
              2. Newton&apos;s Law of Universal Gravitation
            </h2>
            <div className="text-xs text-on-surface-variant leading-relaxed space-y-3">
              <p>
                Newton posited that every point mass attracts every other point mass in the universe
                with a force that is directly proportional to the product of their masses and inversely
                proportional to the square of the distance between them.
              </p>

              <div className="my-4 p-4 bg-surface-container-low rounded-lg flex flex-col sm:flex-row items-center gap-6 border border-outline-variant/60">
                <div className="text-center sm:text-left font-mono font-bold text-xl text-primary py-2 shrink-0">
                  F = G(m<sub>1</sub>m<sub>2</sub>) / r<sup>2</sup>
                </div>
                <div className="text-[11px] border-t sm:border-t-0 sm:border-l border-outline-variant pt-3 sm:pt-0 sm:pl-4 w-full">
                  <ul className="space-y-1">
                    <li><strong>F:</strong> Gravitational force between masses</li>
                    <li><strong>G:</strong> Gravitational constant (6.674×10<sup>-11</sup> N⋅m²/kg²)</li>
                    <li><strong>m₁, m₂:</strong> Masses of the interacting bodies</li>
                    <li><strong>r:</strong> Distance between centers of mass</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar: Resources & Homework */}
        <div className="space-y-6">
          {/* Downloadable Resources */}
          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-xs">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Downloadable Resources
            </h3>

            <div className="space-y-2">
              <a
                href="#download-slides"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Downloading Lesson 4 Slides PDF...')
                }}
                className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-red-50 text-red-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                      Lesson 4 Slides
                    </h4>
                    <span className="text-[10px] text-on-surface-variant">2.4 MB • PDF</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
              </a>

              <a
                href="#download-formulas"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Downloading Formula Cheat Sheet...')
                }}
                className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-red-50 text-red-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                      Formula Cheat Sheet
                    </h4>
                    <span className="text-[10px] text-on-surface-variant">0.8 MB • PDF</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Homework Assignment Card */}
          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
              Assigned Homework
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Problem Set 4: Gravitational Forces is due before the next lecture.
            </p>
            <div className="flex items-center justify-between text-xs mb-4">
              <span className="text-on-surface-variant">Due:</span>
              <span className="font-bold text-on-surface">Oct 24, 11:59 PM</span>
            </div>
            <Link
              href={`/${locale}/dashboard/assignments`}
              className="w-full bg-surface-container-high hover:bg-surface-variant text-on-surface py-2 px-3 rounded-lg text-xs font-semibold transition-colors border border-outline-variant flex items-center justify-center gap-1.5"
            >
              <span>Go to Assignment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Up Next Card */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant border-dashed">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
              Up Next
            </span>
            <p className="text-xs font-bold text-on-surface">
              Lesson 5: Work, Energy, and Power
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
