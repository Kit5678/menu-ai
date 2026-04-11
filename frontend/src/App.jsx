import { useMemo, useState, useEffect, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ingredientOptions = [
  { th: '\u0e44\u0e02\u0e48', en: 'egg' },
  { th: '\u0e44\u0e01\u0e48', en: 'chicken' },
  { th: '\u0e2b\u0e21\u0e39', en: 'pork' },
  { th: '\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e27\u0e31\u0e27', en: 'beef' },
  { th: '\u0e01\u0e38\u0e49\u0e07', en: 'shrimp' },
  { th: '\u0e1b\u0e25\u0e32\u0e2b\u0e21\u0e36\u0e01', en: 'squid' },
  { th: '\u0e40\u0e15\u0e49\u0e32\u0e2b\u0e39\u0e49', en: 'tofu' },
  { th: '\u0e02\u0e49\u0e32\u0e27', en: 'rice' },
  { th: '\u0e40\u0e2a\u0e49\u0e19\u0e01\u0e4b\u0e27\u0e22\u0e40\u0e15\u0e35\u0e4b\u0e22\u0e27', en: 'noodles' },
  { th: '\u0e27\u0e38\u0e49\u0e19\u0e40\u0e2a\u0e49\u0e19', en: 'vermicelli' },
  { th: '\u0e02\u0e19\u0e21\u0e1b\u0e31\u0e07', en: 'bread' },
  { th: '\u0e16\u0e31\u0e48\u0e27\u0e1d\u0e31\u0e01\u0e22\u0e32\u0e27', en: 'yardlong beans' },
  { th: '\u0e04\u0e30\u0e19\u0e49\u0e32', en: 'kale' },
  { th: '\u0e1c\u0e31\u0e01\u0e1a\u0e38\u0e49\u0e07', en: 'morning glory' },
  { th: '\u0e01\u0e30\u0e2b\u0e25\u0e48\u0e33\u0e1b\u0e25\u0e35', en: 'cabbage' },
  { th: '\u0e41\u0e04\u0e23\u0e2d\u0e17', en: 'carrot' },
  { th: '\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e40\u0e17\u0e28', en: 'tomato' },
  { th: '\u0e2b\u0e2d\u0e21\u0e43\u0e2b\u0e0d\u0e48', en: 'onion' },
  { th: '\u0e40\u0e2b\u0e47\u0e14', en: 'mushroom' },
  { th: '\u0e41\u0e15\u0e07\u0e01\u0e27\u0e32', en: 'cucumber' },
  { th: '\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e22\u0e32\u0e27', en: 'eggplant' },
  { th: '\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e40\u0e1b\u0e23\u0e32\u0e30', en: 'thai eggplant' },
  { th: '\u0e42\u0e2b\u0e23\u0e30\u0e1e\u0e32', en: 'basil' },
  { th: '\u0e01\u0e23\u0e30\u0e40\u0e17\u0e35\u0e22\u0e21', en: 'garlic' },
  { th: '\u0e1e\u0e23\u0e34\u0e01', en: 'chili' },
  { th: '\u0e02\u0e34\u0e07', en: 'ginger' },
  { th: '\u0e15\u0e49\u0e19\u0e2b\u0e2d\u0e21', en: 'spring onion' },
  { th: '\u0e1c\u0e31\u0e01\u0e0a\u0e35', en: 'coriander' },
  { th: '\u0e21\u0e31\u0e19\u0e1d\u0e23\u0e31\u0e48\u0e07', en: 'potato' },
  { th: '\u0e1f\u0e31\u0e01\u0e17\u0e2d\u0e07', en: 'pumpkin' },
  { th: '\u0e02\u0e49\u0e32\u0e27\u0e42\u0e1e\u0e14', en: 'corn' },
  { th: '\u0e1e\u0e23\u0e34\u0e01\u0e2b\u0e27\u0e32\u0e19', en: 'bell pepper' },
  { th: '\u0e16\u0e31\u0e48\u0e27\u0e07\u0e2d\u0e01', en: 'bean sprouts' },
  { th: '\u0e21\u0e30\u0e19\u0e32\u0e27', en: 'lime' },
  { th: '\u0e15\u0e30\u0e44\u0e04\u0e23\u0e49', en: 'lemongrass' },
  { th: '\u0e02\u0e48\u0e32', en: 'galangal' },
  { th: '\u0e2a\u0e31\u0e1a\u0e1b\u0e30\u0e23\u0e14', en: 'pineapple' },
  { th: '\u0e1a\u0e23\u0e2d\u0e01\u0e42\u0e04\u0e25\u0e35', en: 'broccoli' },
  { th: '\u0e14\u0e2d\u0e01\u0e01\u0e30\u0e2b\u0e25\u0e48\u0e33', en: 'cauliflower' },
  { th: '\u0e1c\u0e31\u0e01\u0e42\u0e02\u0e21', en: 'spinach' },
  { th: '\u0e40\u0e0b\u0e40\u0e25\u0e2d\u0e23\u0e35', en: 'celery' },
  { th: '\u0e1c\u0e31\u0e01\u0e01\u0e32\u0e14\u0e2b\u0e2d\u0e21', en: 'lettuce' },
  { th: '\u0e1c\u0e31\u0e01\u0e01\u0e27\u0e32\u0e07\u0e15\u0e38\u0e49\u0e07', en: 'bok choy' },
  { th: '\u0e2a\u0e32\u0e2b\u0e23\u0e48\u0e32\u0e22', en: 'seaweed' },
  { th: '\u0e02\u0e49\u0e32\u0e27\u0e01\u0e25\u0e49\u0e2d\u0e07', en: 'brown rice' },
  { th: '\u0e1b\u0e25\u0e32\u0e17\u0e39', en: 'mackerel' },
  { th: '\u0e1b\u0e25\u0e32\u0e41\u0e0b\u0e25\u0e21\u0e2d\u0e19', en: 'salmon' },
  { th: '\u0e1b\u0e39\u0e2d\u0e31\u0e14', en: 'crab stick' },
  { th: '\u0e44\u0e2a\u0e49\u0e01\u0e23\u0e2d\u0e01', en: 'sausage' },
  { th: '\u0e40\u0e1a\u0e04\u0e2d\u0e19', en: 'bacon' }
]

const translations = {
  th: {
    eyebrow: 'ผู้ช่วยแนะนำเมนูด้วย AI',
    title: 'ไอเดียเมนูจากวัตถุดิบที่คุณมีอยู่แล้ว',
    subhead: 'เลือกวัตถุดิบที่มี แล้วระบบจะจัดอันดับเมนูให้ทันที',
    ingredientsLabel: 'เลือกวัตถุดิบจากรายการ',
    recommend: 'แนะนำเมนู',
    loading: 'กำลังโหลดผลลัพธ์...',
    resultsTitle: 'ผลลัพธ์การจัดอันดับ',
    resultsSubtitle: 'จัดอันดับตามความเหมือนของวัตถุดิบ',
    empty: 'ยังไม่มีผลลัพธ์ ลองค้นหาอีกครั้ง',
    matched: 'วัตถุดิบที่ตรงกัน',
    missing: 'วัตถุดิบที่ขาด',
    seasonings: 'เครื่องปรุง',
    score: 'คะแนนความเหมาะสม',
    detail: 'รายละเอียดเมนู',
    time: 'เวลา',
    minutes: 'นาที',
    difficulty: 'ระดับความยาก',
    steps: 'วิธีทำ',
    clear: 'ล้างวัตถุดิบ',
    noOverlap: 'ยังไม่ตรงกับวัตถุดิบที่เลือก',
    apiError: 'เชื่อมต่อ API ไม่ได้ กรุณาตรวจสอบการเปิดบริการ Backend',
    matchedSummary: (n) => `วัตถุดิบตรงกัน ${n} รายการ เหมาะสำหรับทำเมนูนี้`,
  },
  en: {
    eyebrow: 'Recipe matcher',
    title: 'Menu ideas from your ingredients',
    subhead: 'Pick what you have, and we will rank the best matching recipes.',
    ingredientsLabel: 'Pick ingredients from the list',
    recommend: 'Recommend',
    loading: 'Loading results...',
    resultsTitle: 'Ranked results',
    resultsSubtitle: 'Top matches based on ingredient overlap.',
    empty: 'No results yet. Run a search to see recommendations.',
    matched: 'Matched ingredients',
    missing: 'Missing ingredients',
    seasonings: 'Seasonings',
    score: 'Match score',
    detail: 'View details',
    time: 'Time',
    minutes: 'min',
    difficulty: 'Difficulty',
    steps: 'Steps',
    clear: 'Clear ingredients',
    noOverlap: 'No direct overlap',
    apiError: 'Cannot reach the API. Please check the backend service.',
    matchedSummary: (n) => `${n} ingredients match. This recipe is a good fit.`,
  }
}

const difficultyMap = {
  th: { easy: 'ง่าย', medium: 'ปานกลาง', hard: 'ยาก' },
  en: { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
}

const containsThai = (text) => /[฀-๿]/.test(text || '')


function App() {
  const [selectedIds, setSelectedIds] = useState([])
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('th')
  const [theme, setTheme] = useState('light')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const loadingTimerRef = useRef(null)
  const activeRequestRef = useRef({ controller: null, id: 0 })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
      if (activeRequestRef.current.controller) {
        activeRequestRef.current.controller.abort()
      }
    }
  }, [])

  const ingredients = useMemo(() => {
    return [...selectedIds]
  }, [selectedIds])

  const mapMatchedLabel = (value) => {
    const foundByEn = ingredientOptions.find((item) => item.en === value)
    if (foundByEn) return language === 'th' ? foundByEn.th : foundByEn.en
    const foundByTh = ingredientOptions.find((item) => item.th === value)
    if (foundByTh) return language === 'th' ? foundByTh.th : foundByTh.en
    return value
  }

  const fetchResults = async () => {
    setError('')
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current)
      loadingTimerRef.current = null
    }
    if (activeRequestRef.current.controller) {
      activeRequestRef.current.controller.abort()
    }
    const controller = new AbortController()
    const requestId = activeRequestRef.current.id + 1
    activeRequestRef.current = { controller, id: requestId }
    setLoading(true)
    const start = Date.now()
    const minDurationMs = 600

    try {
      const response = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, language }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = await response.json()
      if (activeRequestRef.current.id === requestId) {
        setResults(data.results || [])
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError(translations[language].apiError)
    } finally {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, minDurationMs - elapsed)
      loadingTimerRef.current = setTimeout(() => {
        if (activeRequestRef.current.id === requestId) {
          setLoading(false)
          loadingTimerRef.current = null
        }
      }, remaining)
    }
  }

  const toggleIngredient = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const clearIngredients = () => {
    setSelectedIds([])
  }

  const getRecipeName = (item) =>
    language === 'th' ? item.name_th || item.name_en : item.name_en || item.name_th

  const getReason = (item) => {
    if (item.ai_reason) {
      const hasThai = containsThai(item.ai_reason)
      if (language === 'th' && hasThai) return item.ai_reason
      if (language === 'en' && !hasThai) return item.ai_reason
    }
    return t.matchedSummary(item.matched.length)
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-[#1f1b16] transition-colors duration-300 dark:bg-[#15130f] dark:text-[#f7efe5]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-full border border-[#e6dac8] px-4 py-2 text-sm font-semibold transition dark:border-[#3b342b]"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button
            type="button"
            onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
            className="rounded-full border border-[#e6dac8] px-4 py-2 text-sm font-semibold transition dark:border-[#3b342b]"
          >
            {language === 'th' ? 'EN' : 'TH'}
          </button>
        </div>

        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-[#7a6f63] dark:text-[#cbbfb3]">
            {t.eyebrow}
          </p>
          <h1 className="text-4xl font-semibold text-[#1f1b16] dark:text-[#f7efe5] sm:text-5xl">
            {t.title}
          </h1>
          <p className="max-w-2xl text-base text-[#7a6f63] dark:text-[#cbbfb3]">
            {t.subhead}
          </p>
        </header>

        <section className="rounded-3xl border border-[#e6dac8] bg-white/70 p-6 shadow-sm dark:border-[#3b342b] dark:bg-[#1f1a14]">
          <div className="space-y-4">
            <label className="text-sm font-semibold">{t.ingredientsLabel}</label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {ingredientOptions.map((item) => {
                const checked = selectedIds.includes(item.en)
                return (
                  <label
                    key={item.en}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                      checked
                        ? 'border-[#e4572e] bg-[#fff5ef] text-[#1f1b16] dark:bg-[#2a2119] dark:text-[#f7efe5]'
                        : 'border-[#e6dac8] bg-white dark:border-[#3b342b] dark:bg-[#1a1510]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleIngredient(item.en)}
                      className="accent-[#e4572e]"
                    />
                    {language === 'th' ? item.th : item.en}
                  </label>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (loading || ingredients.length === 0) return
                  fetchResults()
                }}
                disabled={ingredients.length === 0}
                aria-disabled={loading || ingredients.length === 0}
                aria-busy={loading}
                className={`group relative inline-flex min-w-[140px] items-center justify-center gap-2 overflow-hidden rounded-full bg-[#e4572e] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(228,87,46,0.28)] ring-1 ring-[#e4572e]/40 transition-colors hover:bg-[#cf4c29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f08a5d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f5f0] ${ingredients.length === 0 ? 'cursor-not-allowed bg-[#e0b6a8] shadow-none ring-0' : ''} ${loading ? 'cursor-wait' : ''}`}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                <span className={`inline-block h-2 w-2 rounded-full bg-white/80 transition-opacity duration-200 ${loading ? 'animate-pulse opacity-100' : 'opacity-0'}`} />
                <span>{t.recommend}</span>
              </button>
              <button
                type="button"
                onClick={clearIngredients}
                disabled={selectedIds.length === 0}
                className="rounded-full border border-[#e6dac8] px-4 py-2 text-sm font-semibold text-[#1f1b16] transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3b342b] dark:text-[#f7efe5]"
              >
                {t.clear}
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">{t.resultsTitle}</h2>
          <p className="text-sm text-[#7a6f63] dark:text-[#cbbfb3]">{t.resultsSubtitle}</p>
          {loading && (
            <div className="rounded-2xl border border-[#efe3d5] bg-[#fffaf5] px-4 py-3 text-sm text-[#7a6f63] shadow-sm dark:border-[#2f271e] dark:bg-[#1b1610] dark:text-[#cbbfb3]">
              {t.loading}
            </div>
          )}
          {!loading && results.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[#e6dac8] bg-white/60 px-4 py-3 text-sm text-[#7a6f63] dark:border-[#3b342b] dark:bg-[#1f1a14] dark:text-[#cbbfb3]">
              {t.empty}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((item) => (
              <article key={item.id} className="rounded-2xl border border-[#e6dac8] bg-white p-4 shadow-sm dark:border-[#3b342b] dark:bg-[#1f1a14]">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{getRecipeName(item)}</h3>
                  <p className="text-sm font-semibold text-[#e4572e]">
                    {t.score}: {item.score}
                  </p>
                  <div className="rounded-xl border border-[#efe3d5] bg-[#fffaf5] p-3 text-sm text-[#7a6f63] dark:border-[#2f271e] dark:bg-[#1b1610] dark:text-[#cbbfb3]">
                    <p>{getReason(item)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRecipe(item)}
                    className="rounded-full border border-[#e6dac8] px-3 py-1 text-xs font-semibold text-[#1f1b16] transition dark:border-[#3b342b] dark:text-[#f7efe5]"
                  >
                    {t.detail}
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6f63] dark:text-[#cbbfb3]">
                      {t.matched}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.matched.length > 0 ? (
                        item.matched.map((match, idx) => (
                          <span key={`${match}-${idx}`} className="rounded-full bg-[#f5e5d6] px-3 py-1 text-xs dark:bg-[#2b2218]">
                            {mapMatchedLabel(match)}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-[#f5e5d6] px-3 py-1 text-xs text-[#7a6f63] dark:bg-[#2b2218] dark:text-[#cbbfb3]">
                          {t.noOverlap}
                        </span>
                      )}
                    </div>
                  </div>
                  {(language === 'th' ? item.missing_th : item.missing_en)?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6f63] dark:text-[#cbbfb3]">
                        {t.missing}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(language === 'th' ? item.missing_th : item.missing_en).map((missing, idx) => (
                          <span key={`${missing}-${idx}`} className="rounded-full bg-[#f0ede8] px-3 py-1 text-xs text-[#7a6f63] dark:bg-[#242019]">
                            {missing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(language === 'th' ? item.seasonings_th : item.seasonings_en)?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6f63] dark:text-[#cbbfb3]">
                        {t.seasonings}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(language === 'th' ? item.seasonings_th : item.seasonings_en).map((season, idx) => (
                          <span key={`${season}-${idx}`} className="rounded-full bg-[#f5e5d6] px-3 py-1 text-xs dark:bg-[#2b2218]">
                            {season}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl dark:bg-[#1f1a14]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{getRecipeName(selectedRecipe)}</h3>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="rounded-full border border-[#e6dac8] px-3 py-1 text-sm dark:border-[#3b342b]"
              >
                X
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#7a6f63] dark:text-[#cbbfb3]">
              <span>
                {t.time}: {selectedRecipe.time_min} {t.minutes}
              </span>
              <span>
                {t.difficulty}: {difficultyMap[language][selectedRecipe.difficulty] || selectedRecipe.difficulty}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold">{t.steps}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[#7a6f63] dark:text-[#cbbfb3]">
                {(language === 'th' ? selectedRecipe.steps_th : selectedRecipe.steps_en).map((step, idx) => (
                  <li key={`${step}-${idx}`}>{step}</li>
                ))}
              </ol>
            </div>
            {(language === 'th' ? selectedRecipe.seasonings_th : selectedRecipe.seasonings_en)?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold">{t.seasonings}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(language === 'th' ? selectedRecipe.seasonings_th : selectedRecipe.seasonings_en).map((season, idx) => (
                    <span key={`${season}-${idx}`} className="rounded-full bg-[#f5e5d6] px-3 py-1 text-xs dark:bg-[#2b2218]">
                      {season}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
