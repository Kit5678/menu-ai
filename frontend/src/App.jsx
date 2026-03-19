import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const ingredientOptions = [
  { th: '\u0e44\u0e02\u0e48', en: 'egg' },
  { th: '\u0e44\u0e01\u0e48', en: 'chicken' },
  { th: '\u0e2b\u0e21\u0e39', en: 'pork' },
  { th: '\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e27\u0e31\u0e27', en: 'beef' },
  { th: '\u0e01\u0e38\u0e49\u0e07', en: 'shrimp' },
  { th: '\u0e40\u0e15\u0e49\u0e32\u0e2b\u0e39\u0e49', en: 'tofu' },
  { th: '\u0e1b\u0e25\u0e32\u0e2b\u0e21\u0e36\u0e01', en: 'squid' },
  { th: '\u0e1b\u0e25\u0e32\u0e17\u0e39', en: 'mackerel' },
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
  { th: '\u0e42\u0e2b\u0e23\u0e30\u0e1e\u0e32', en: 'basil' }
]

const translations = {
  th: {
    eyebrow: '\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22\u0e41\u0e19\u0e30\u0e19\u0e33\u0e40\u0e21\u0e19\u0e39\u0e14\u0e49\u0e27\u0e22 AI',
    title: '\u0e44\u0e2d\u0e40\u0e14\u0e35\u0e22\u0e40\u0e21\u0e19\u0e39\u0e08\u0e32\u0e01\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1a\u0e17\u0e35\u0e48\u0e04\u0e38\u0e13\u0e21\u0e35\u0e2d\u0e22\u0e39\u0e48\u0e41\u0e25\u0e49\u0e27',
    subhead: '\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1a\u0e43\u0e19\u0e04\u0e23\u0e31\u0e27 \u0e41\u0e25\u0e49\u0e27\u0e23\u0e30\u0e1a\u0e1a\u0e08\u0e30\u0e08\u0e31\u0e14\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a\u0e40\u0e21\u0e19\u0e39\u0e17\u0e35\u0e48\u0e40\u0e2b\u0e21\u0e32\u0e30\u0e2a\u0e21\u0e43\u0e2b\u0e49\u0e17\u0e31\u0e19\u0e17\u0e35',
    ingredientsLabel: '\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1a\u0e08\u0e32\u0e01\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23',
    recommend: '\u0e41\u0e19\u0e30\u0e19\u0e33\u0e40\u0e21\u0e19\u0e39',
    ranking: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e08\u0e31\u0e14\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a...',
    loading: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14\u0e1c\u0e25\u0e25\u0e31\u0e1e\u0e18\u0e4c...',
    resultsTitle: '\u0e1c\u0e25\u0e25\u0e31\u0e1e\u0e18\u0e4c\u0e01\u0e32\u0e23\u0e08\u0e31\u0e14\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a',
    resultsSubtitle: '\u0e08\u0e31\u0e14\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a\u0e15\u0e32\u0e21\u0e04\u0e27\u0e32\u0e21\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e02\u0e2d\u0e07\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1a',
    empty: '\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35\u0e1c\u0e25\u0e25\u0e31\u0e1e\u0e18\u0e4c \u0e25\u0e2d\u0e07\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07',
    matched: '\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1a\u0e17\u0e35\u0e48\u0e15\u0e23\u0e07\u0e01\u0e31\u0e19',
    missing: '\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1b\u0e17\u0e35\u0e48\u0e02\u0e32\u0e14',
    substitutes: '\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1b\u0e17\u0e14\u0e41\u0e17\u0e19\u0e17\u0e35\u0e48\u0e41\u0e19\u0e30\u0e19\u0e33',
    score: '\u0e04\u0e30\u0e41\u0e19\u0e19\u0e04\u0e27\u0e32\u0e21\u0e40\u0e2b\u0e21\u0e32\u0e30\u0e2a\u0e21',
    apiError: '\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e21\u0e15\u0e48\u0e2d API \u0e44\u0e21\u0e48\u0e44\u0e14\u0e49 \u0e01\u0e23\u0e38\u0e13\u0e32\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e01\u0e32\u0e23\u0e40\u0e1b\u0e34\u0e14\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23 Backend',
    detail: '\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14\u0e40\u0e21\u0e19\u0e39',
    time: '\u0e40\u0e27\u0e25\u0e32',
    minutes: '\u0e19\u0e32\u0e17\u0e35',
    difficulty: '\u0e23\u0e30\u0e14\u0e31\u0e1a',
    steps: '\u0e27\u0e34\u0e18\u0e35\u0e17\u0e33',
    matchedSummary: (n) => `\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1b\u0e15\u0e23\u0e07\u0e01\u0e31\u0e19 ${n} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23 \u0e40\u0e2b\u0e21\u0e32\u0e30\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e17\u0e33\u0e40\u0e21\u0e19\u0e39\u0e19\u0e35\u0e49`,
    seasonings: '\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e1b\u0e23\u0e38\u0e07',
    clear: '\u0e25\u0e49\u0e32\u0e07\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1a',
    noOverlap: '\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e15\u0e23\u0e07\u0e01\u0e31\u0e1a\u0e27\u0e31\u0e15\u0e16\u0e38\u0e14\u0e34\u0e1b\u0e17\u0e35\u0e48\u0e40\u0e25\u0e37\u0e2d\u0e01'
  },
  en: {
    eyebrow: 'AI Recipe Matcher',
    title: 'Menu ideas from the ingredients you already have',
    subhead: 'Pick ingredients and the system ranks the most relevant recipes instantly.',
    ingredientsLabel: 'Pick ingredients from the list',
    recommend: 'Recommend menus',
    ranking: 'Ranking...',
    loading: 'Loading results...',
    resultsTitle: 'Ranked results',
    resultsSubtitle: 'Top matches based on ingredient overlap.',
    empty: 'No results yet. Try running a search.',
    matched: 'Matched ingredients',
    missing: 'Missing ingredients',
    substitutes: 'Suggested substitutes',
    score: 'Match score',
    apiError: 'Cannot reach the API. Start the FastAPI server first.',
    detail: 'View details',
    time: 'Time',
    minutes: 'min',
    difficulty: 'Difficulty',
    steps: 'Steps',
    matchedSummary: (n) => `${n} ingredients match. This recipe is a good fit.`,
    seasonings: 'Seasonings',
    clear: 'Clear ingredients',
    noOverlap: 'No direct overlap'
  }
}

function App() {
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('th')
  const [theme, setTheme] = useState('light')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [resultLanguage, setResultLanguage] = useState('th')
  const [selectedIds, setSelectedIds] = useState(['egg', 'rice'])
  const [showLoading, setShowLoading] = useState(false)
  const loadingTimerRef = useRef(null)
  const hideTimerRef = useRef(null)
  const loadingStartRef = useRef(0)
  const showLoadingSinceRef = useRef(0)
  const hasResultsRef = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', language)
  }, [language])

  useEffect(() => {
    hasResultsRef.current = results.length > 0
  }, [results.length])

  useEffect(() => {
    if (loading) {
      loadingStartRef.current = Date.now()
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      loadingTimerRef.current = setTimeout(() => {
        setShowLoading(true)
        showLoadingSinceRef.current = Date.now()
      }, 250)
    } else {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
        loadingTimerRef.current = null
      }
      if (showLoading) {
        const elapsed = Date.now() - showLoadingSinceRef.current
        const minVisible = 400
        const delay = Math.max(0, minVisible - elapsed)
        if (delay == 0) {
          setShowLoading(false)
        } else {
          hideTimerRef.current = setTimeout(() => {
            setShowLoading(false)
            hideTimerRef.current = null
          }, delay)
        }
      } else {
        setShowLoading(false)
      }
    }
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
        loadingTimerRef.current = null
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [loading, showLoading])

  const ingredients = useMemo(() => {
    return selectedIds.map((id) => {
      const found = ingredientOptions.find((item) => item.en === id)
      return language === 'th' ? found?.th || id : found?.en || id
    })
  }, [selectedIds, language])

  const fetchResults = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const apiBase =
        import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBase}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, language })
      })

      if (!response.ok) {
        throw new Error('Server error')
      }

      const data = await response.json()
      setResults(data.results || [])
      setResultLanguage(data.language || language)
    } catch (err) {
      setError(translations[language].apiError)
    } finally {
      setLoading(false)
    }
  }, [ingredients, language])

  const handleSubmit = async (event) => {
    event.preventDefault()
    await fetchResults()
  }

  useEffect(() => {
    if (hasResultsRef.current) {
      fetchResults()
    }
  }, [language, fetchResults])

  const t = translations[language]

  const difficultyMap = {
    th: { easy: '\u0e07\u0e48\u0e32\u0e22', medium: '\u0e1b\u0e32\u0e19\u0e01\u0e25\u0e32\u0e07', hard: '\u0e22\u0e32\u0e01' },
    en: { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
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

  return (
    <div className="page">
      <div className="toolbar">
        <button
          type="button"
          className="toggle"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <button
          type="button"
          className="toggle"
          onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
        >
          {language === 'th' ? 'EN' : 'TH'}
        </button>
      </div>
      <header className="hero">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="subhead">{t.subhead}</p>
      </header>

      <section className="panel">
        <form onSubmit={handleSubmit} className="form">
          <div className="select-row">
            <label>{t.ingredientsLabel}</label>
            <div className="ingredient-grid">
              {ingredientOptions.map((item) => {
                const id = item.en
                const label = language === 'th' ? item.th : item.en
                const checked = selectedIds.includes(id)
                return (
                  <label key={id} className={`pill ${checked ? 'on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleIngredient(id)}
                    />
                    {label}
                  </label>
                )
              })}
            </div>
          </div>
          <div className="controls">
            <button type="submit" disabled={loading || ingredients.length === 0}>
              {loading ? t.ranking : t.recommend}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={clearIngredients}
              disabled={selectedIds.length === 0}
            >
              {t.clear}
            </button>
          </div>
        </form>

        {error && <div className="error">{error}</div>}
      </section>

      <section className="results">
        <div className="results-head">
          <h2>{t.resultsTitle}</h2>
          <p>{t.resultsSubtitle}</p>
          {showLoading && (
            <div className="loading">
              <span className="dot" />
              <span>{t.loading}</span>
            </div>
          )}
        </div>
        <div className="cards">
          {results.length === 0 && !loading && (
            <div className="empty">{t.empty}</div>
          )}
          {results.length === 0 && showLoading && (
            <>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="card skeleton">
                  <div className="skeleton-line title" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-tags">
                    <span className="skeleton-chip" />
                    <span className="skeleton-chip" />
                    <span className="skeleton-chip" />
                  </div>
                </div>
              ))}
            </>
          )}
          {results.map((item) => (
            <article key={item.id} className="card">
              <div>
                <h3>{getRecipeName(item)}</h3>
                <p className="score">
                  {t.score}: {item.score}
                </p>
                {item.ai_reason && resultLanguage === language && (
                  <p className="reason">{item.ai_reason}</p>
                )}
                {(!item.ai_reason || resultLanguage !== language) && (
                  <p className="reason">{t.matchedSummary(item.matched.length)}</p>
                )}
                <button
                  type="button"
                  className="detail"
                  onClick={() => setSelectedRecipe(item)}
                >
                  {t.detail}
                </button>
              </div>
              <div className="meta">
                <p>{t.matched}</p>
                <div className="tag-row">
                  {item.matched.length > 0 ? (
                    item.matched.map((match) => (
                      <span key={match} className="tag">
                        {match}
                      </span>
                    ))
                  ) : (
                    <span className="tag muted">{t.noOverlap}</span>
                  )}
                </div>
                {((language === 'th'
                  ? item.missing_th
                  : item.missing_en) || []).length > 0 && (
                  <>
                    <p className="meta-title">{t.missing}</p>
                    <div className="tag-row">
                      {(language === 'th'
                        ? item.missing_th
                        : item.missing_en
                      ).map((missing) => (
                        <span key={missing} className="tag muted">
                          {missing}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {item.ai_substitutes && item.ai_substitutes.length > 0 && (
                  <>
                    <p className="meta-title">{t.substitutes}</p>
                    <div className="tag-row">
                      {item.ai_substitutes.map((sub) => (
                        <span key={sub} className="tag">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {(item.seasonings_th?.length > 0 ||
                  item.seasonings_en?.length > 0) && (
                  <>
                    <p className="meta-title">{t.seasonings}</p>
                    <div className="tag-row">
                      {(language === 'th'
                        ? item.seasonings_th
                        : item.seasonings_en
                      ).map((season) => (
                        <span key={season} className="tag">
                          {season}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      {selectedRecipe && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-head">
              <h3>{getRecipeName(selectedRecipe)}</h3>
              <button
                type="button"
                className="close"
                onClick={() => setSelectedRecipe(null)}
              >
                X
              </button>
            </div>
            <div className="modal-meta">
              <span>
                {t.time}: {selectedRecipe.time_min} {t.minutes}
              </span>
              <span>
                {t.difficulty}:{' '}
                {difficultyMap[language][selectedRecipe.difficulty] ||
                  selectedRecipe.difficulty}
              </span>
            </div>
            <div className="modal-steps">
              <p>{t.steps}</p>
              <ol>
                {(language === 'th'
                  ? selectedRecipe.steps_th
                  : selectedRecipe.steps_en
                ).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            {(selectedRecipe.seasonings_th?.length > 0 ||
              selectedRecipe.seasonings_en?.length > 0) && (
              <div className="modal-steps">
                <p>{t.seasonings}</p>
                <div className="tag-row">
                  {(language === 'th'
                    ? selectedRecipe.seasonings_th
                    : selectedRecipe.seasonings_en
                  ).map((season) => (
                    <span key={season} className="tag">
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
