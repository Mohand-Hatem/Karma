'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Sparkles,
  SquarePen,
  Shield,
  Bot,
  Database,
  CheckCircle2,
  Copy,
  RefreshCw,
  Paperclip,
  Send,
  Check,
  TrendingDown,
  Edit3,
  HelpCircle,
  Mail,
} from 'lucide-react'
import { useShellStore } from '../../../../../stores/shell-store'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  toolCitation?: string
  tableData?: {
    name: string
    id: string
    percentage: string
  }[]
  followUpPrompt?: string
}

export interface ConversationThread {
  id: string
  title: string
  group: 'today' | 'yesterday'
  lastActive: string
  messages: ChatMessage[]
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Conversations (cloned from Stitch Screen 32)
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_THREADS: ConversationThread[] = [
  {
    id: 'thread-1',
    title: '10A Attendance Analysis',
    group: 'today',
    lastActive: '10m ago',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Which students in 10A have attendance below 80% this semester?',
        timestamp: '10:42 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content:
          'Based on the current semester records for Class 10A, there are **3 students** currently falling below the 80% attendance threshold:',
        timestamp: '10:42 AM',
        toolCitation: 'Queried Class 10A Attendance Service',
        tableData: [
          { name: 'Sarah Jenkins', id: '#10042', percentage: '76.5%' },
          { name: 'Michael Chang', id: '#10089', percentage: '78.2%' },
          { name: 'David O’Connor', id: '#10112', percentage: '79.1%' },
        ],
        followUpPrompt:
          'Would you like me to draft an intervention notice for these students’ parents?',
      },
    ],
  },
  {
    id: 'thread-2',
    title: 'Physics Curriculum Planning',
    group: 'today',
    lastActive: '2h ago',
    messages: [
      {
        id: 'msg-p1',
        role: 'user',
        content: 'Outline the 4 core learning objectives for Grade 10 Mechanics unit.',
        timestamp: '8:15 AM',
      },
      {
        id: 'msg-p2',
        role: 'assistant',
        content:
          'Here are the 4 core objectives aligned with the national curriculum:\n1. Newton’s Laws of Motion and vector forces.\n2. Work, Energy, and Power conservation models.\n3. Linear Momentum and Impulse dynamics.\n4. Experimental measurement with ticker-tape and photogates.',
        timestamp: '8:16 AM',
        toolCitation: 'Queried Academic Curriculum Database',
      },
    ],
  },
  {
    id: 'thread-3',
    title: 'Parent Communication Draft',
    group: 'yesterday',
    lastActive: 'Yesterday',
    messages: [
      {
        id: 'msg-pc1',
        role: 'user',
        content: 'Draft a polite reminder regarding elective selections for Term 2.',
        timestamp: 'Yesterday 3:00 PM',
      },
      {
        id: 'msg-pc2',
        role: 'assistant',
        content:
          'Dear Parents,\n\nThis is a gentle reminder that the portal for selecting Term 2 electives will close this Friday at 5:00 PM. Please ensure your child reviews the course catalogue with you.\n\nWarm regards,\nAcademic Administration',
        timestamp: 'Yesterday 3:01 PM',
      },
    ],
  },
  {
    id: 'thread-4',
    title: 'Grade Distribution Q2',
    group: 'yesterday',
    lastActive: 'Yesterday',
    messages: [
      {
        id: 'msg-gd1',
        role: 'user',
        content: 'Show the average grade distribution across Grade 11 Science streams.',
        timestamp: 'Yesterday 11:20 AM',
      },
      {
        id: 'msg-gd2',
        role: 'assistant',
        content:
          'Across all Grade 11 Science sections:\n- Average: 84.3%\n- Median: 86.0%\n- Highest Section: 11-A (88.1% average).',
        timestamp: 'Yesterday 11:21 AM',
        toolCitation: 'Queried Gradebook & Report Card Service',
      },
    ],
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: EduAiPage
 * ────────────────────────────────────────────────────────────────────────── */

export default function EduAiPage() {
  const t = useTranslations('features.ai')
  const { activeRole } = useShellStore()

  const [threads, setThreads] = useState<ConversationThread[]>(INITIAL_THREADS)
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1')
  const [inputPrompt, setInputPrompt] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeThread =
    threads.find((th) => th.id === activeThreadId) || threads[0]

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeThread?.messages, isTyping])

  // New Chat Action
  const handleNewChat = () => {
    const newThread: ConversationThread = {
      id: `thread-${Date.now()}`,
      title: 'New Conversation',
      group: 'today',
      lastActive: 'Just now',
      messages: [],
    }
    setThreads([newThread, ...threads])
    setActiveThreadId(newThread.id)
    setInputPrompt('')
  }

  // Send Message Handler
  const handleSendMessage = (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim()
    if (!prompt || !activeThread) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: 'Just now',
    }

    // Append user message
    const updatedMessages = [...activeThread.messages, userMsg]
    const updatedThreadTitle =
      activeThread.messages.length === 0
        ? prompt.slice(0, 28) + (prompt.length > 28 ? '...' : '')
        : activeThread.title

    setThreads((prev) =>
      prev.map((th) =>
        th.id === activeThread.id
          ? { ...th, title: updatedThreadTitle, messages: updatedMessages }
          : th
      )
    )

    setInputPrompt('')
    setIsTyping(true)

    // Simulate AI generation with contextual response
    setTimeout(() => {
      let assistantMsg: ChatMessage

      if (prompt.toLowerCase().includes('notice') || prompt.toLowerCase().includes('intervention')) {
        assistantMsg = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content:
            'Here is a personalized intervention notice draft for parents of students below 80% attendance:\n\n**Subject: Academic Attendance Alert - Immediate Review Required**\n\nDear Parent/Guardian,\n\nWe value regular attendance as essential for academic achievement. Our records indicate that your student’s attendance has fallen below the 80% threshold. Please schedule a brief meeting with the academic counselor to review support resources.',
          timestamp: 'Just now',
          toolCitation: 'Queried Parent Notification Service',
        }
      } else if (prompt.toLowerCase().includes('trend') || prompt.toLowerCase().includes('attendance')) {
        assistantMsg = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content:
            'Attendance trend analysis for Class 10A reveals an overall 91.4% attendance rate, with lowest attendance recorded during Friday morning laboratory sessions.',
          timestamp: 'Just now',
          toolCitation: 'Queried Historical Attendance Records',
        }
      } else {
        assistantMsg = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `I analyzed your request: "${prompt}". Based on institutional records, all corresponding academic policies and data sets are aligned with the ${activeRole} scope. Let me know if you would like me to generate further reports.`,
          timestamp: 'Just now',
          toolCitation: 'Queried Institutional Academic Knowledge Graph',
        }
      }

      setThreads((prev) =>
        prev.map((th) =>
          th.id === activeThread.id
            ? { ...th, messages: [...updatedMessages, assistantMsg] }
            : th
        )
      )
      setIsTyping(false)
    }, 700)
  }

  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedMsgId(msgId)
    setToastMessage('Copied to clipboard!')
    setTimeout(() => {
      setCopiedMsgId(null)
      setToastMessage(null)
    }, 2500)
  }

  const handleRegenerate = () => {
    if (!activeThread || activeThread.messages.length < 2) return
    const lastUserMsg = [...activeThread.messages]
      .reverse()
      .find((m) => m.role === 'user')
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-lowest shadow-sm">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Sidebar + Chat Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* ──────────────────────────────────────────────────────────────────────────
         * Left Chat History Sidebar (Stitch Screen 32 exact clone)
         * ────────────────────────────────────────────────────────────────────────── */}
        <aside className="w-64 sm:w-72 bg-surface-container-low border-r border-outline-variant flex flex-col h-full shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">
                {t('chatHeading')}
              </h3>
            </div>
            <button
              onClick={handleNewChat}
              title={t('newChat')}
              className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-container-high"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Today Group */}
            <div>
              <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-2 py-1">
                {t('today')}
              </div>
              <div className="space-y-1 mt-1">
                {threads
                  .filter((th) => th.group === 'today')
                  .map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setActiveThreadId(th.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold truncate transition-colors border ${
                        activeThreadId === th.id
                          ? 'bg-surface-container-lowest text-primary border-outline-variant shadow-xs'
                          : 'text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      {th.title}
                    </button>
                  ))}
              </div>
            </div>

            {/* Yesterday Group */}
            <div>
              <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-2 py-1">
                {t('yesterday')}
              </div>
              <div className="space-y-1 mt-1">
                {threads
                  .filter((th) => th.group === 'yesterday')
                  .map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setActiveThreadId(th.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold truncate transition-colors border ${
                        activeThreadId === th.id
                          ? 'bg-surface-container-lowest text-primary border-outline-variant shadow-xs'
                          : 'text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      {th.title}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ──────────────────────────────────────────────────────────────────────────
         * Right Chat Interface (Stitch Screen 32 exact clone)
         * ────────────────────────────────────────────────────────────────────────── */}
        <section className="flex-1 flex flex-col bg-surface-container-lowest h-full relative overflow-hidden">
          {/* Disclaimer Security Top Bar */}
          <div className="bg-surface-container-low border-b border-outline-variant py-2 px-6 flex items-center justify-center gap-2 shadow-xs shrink-0">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-on-surface-variant font-medium">
              {t('disclaimer')}
            </span>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeThread.messages.length === 0 ? (
              /* Welcome Screen for Fresh Chats */
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4 shadow-sm border border-outline-variant">
                  <Bot className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-on-surface mb-2">
                  {t('welcomeHeading')}
                </h2>
                <p className="text-xs text-on-surface-variant max-w-md mb-6">
                  {t('subtitle')}
                </p>

                {/* Initial suggested prompt buttons */}
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  <button
                    onClick={() => handleSendMessage(t('suggestNotice'))}
                    className="bg-surface-container-low text-on-surface-variant text-xs font-medium px-3 py-2 rounded-full border border-outline-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('suggestNotice')}</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage(t('suggestTrend'))}
                    className="bg-surface-container-low text-on-surface-variant text-xs font-medium px-3 py-2 rounded-full border border-outline-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{t('suggestTrend')}</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage(t('suggestQuiz'))}
                    className="bg-surface-container-low text-on-surface-variant text-xs font-medium px-3 py-2 rounded-full border border-outline-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{t('suggestQuiz')}</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage(t('suggestParent'))}
                    className="bg-surface-container-low text-on-surface-variant text-xs font-medium px-3 py-2 rounded-full border border-outline-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{t('suggestParent')}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Message List */
              <>
                {activeThread.messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.role === 'user' ? (
                      /* User Message Bubble */
                      <div className="flex justify-end max-w-2xl ml-auto w-full">
                        <div className="bg-primary text-on-primary rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs max-w-[85%]">
                          <p className="text-sm font-medium leading-relaxed">
                            {msg.content}
                          </p>
                          <span className="text-[10px] text-on-primary/70 block text-right mt-1">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* AI Response Bubble */
                      <div className="flex gap-3 max-w-3xl mr-auto w-full items-start">
                        <div className="w-8 h-8 rounded-full bg-secondary-container border border-outline-variant flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>

                        <div className="flex flex-col gap-2 w-full max-w-[92%]">
                          {/* Tool Citation Badge (Stitch Screen 32 exact badge) */}
                          {msg.toolCitation && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant bg-surface-container-low rounded-md px-2.5 py-1 border border-outline-variant w-fit shadow-xs">
                              <Database className="w-3.5 h-3.5 text-primary" />
                              <span>{msg.toolCitation}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                          )}

                          {/* Message Content Body */}
                          <div className="bg-surface-container-lowest rounded-2xl rounded-tl-xs p-4 shadow-xs border border-outline-variant text-on-surface space-y-3">
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                              {msg.content}
                            </p>

                            {/* Structured Table (if present in Stitch response) */}
                            {msg.tableData && (
                              <div className="rounded-lg border border-outline-variant overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-bold">
                                      <th className="px-3 py-2">Student Name</th>
                                      <th className="px-3 py-2">ID</th>
                                      <th className="px-3 py-2 text-right">
                                        Attendance %
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-outline-variant">
                                    {msg.tableData.map((row) => (
                                      <tr
                                        key={row.id}
                                        className="hover:bg-surface-container-low/50 transition-colors"
                                      >
                                        <td className="px-3 py-2 font-medium text-on-surface">
                                          {row.name}
                                        </td>
                                        <td className="px-3 py-2 text-outline">
                                          {row.id}
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-red-600">
                                          {row.percentage}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Follow-up Prompt Suggestion */}
                            {msg.followUpPrompt && (
                              <p className="text-xs text-on-surface-variant italic pt-1">
                                {msg.followUpPrompt}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons: Copy, Regenerate */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() =>
                                handleCopyText(
                                  `${msg.content}\n${msg.followUpPrompt || ''}`,
                                  msg.id
                                )
                              }
                              title={t('copy')}
                              className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-md hover:bg-surface-container"
                            >
                              {copiedMsgId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={handleRegenerate}
                              title={t('regenerate')}
                              className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-md hover:bg-surface-container"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isTyping && (
                  <div className="flex gap-3 max-w-3xl mr-auto w-full items-start animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-secondary-container border border-outline-variant flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant text-xs text-on-surface-variant">
                      EduAI is querying academic services...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────────────────────
           * Input Composer & Floating Suggestion Chips (Stitch Screen 32 exact clone)
           * ────────────────────────────────────────────────────────────────────────── */}
          <div className="p-4 border-t border-outline-variant bg-surface-container-lowest shrink-0">
            {/* Suggestion Chips floating above input */}
            <div className="flex gap-2 overflow-x-auto pb-3 max-w-3xl mx-auto">
              <button
                onClick={() => handleSendMessage(t('suggestNotice'))}
                className="bg-surface-container-low text-on-surface-variant text-xs font-medium px-3 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
              >
                <Edit3 className="w-3 h-3 text-primary" />
                <span>{t('suggestNotice')}</span>
              </button>
              <button
                onClick={() => handleSendMessage(t('suggestTrend'))}
                className="bg-surface-container-low text-on-surface-variant text-xs font-medium px-3 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
              >
                <TrendingDown className="w-3 h-3 text-primary" />
                <span>{t('suggestTrend')}</span>
              </button>
              <button
                onClick={() => handleSendMessage(t('suggestQuiz'))}
                className="bg-surface-container-low text-on-surface-variant text-xs font-medium px-3 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
              >
                <HelpCircle className="w-3 h-3 text-primary" />
                <span>{t('suggestQuiz')}</span>
              </button>
            </div>

            {/* Input Box */}
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2 bg-surface-container-low border border-outline-variant focus-within:ring-2 focus-within:ring-primary focus-within:border-primary rounded-xl p-2 shadow-xs transition-all">
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage('Attachment upload ready (PDF, CSV).')
                    setTimeout(() => setToastMessage(null), 2500)
                  }}
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <textarea
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  rows={1}
                  placeholder={t('placeholder')}
                  className="w-full bg-transparent border-none focus:outline-none resize-none py-2 text-sm text-on-surface placeholder:text-outline max-h-32"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || isTyping}
                  className="p-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Disclaimer Footnote */}
              <div className="text-center mt-2">
                <span className="text-[11px] text-outline">
                  {t('footnote')}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
