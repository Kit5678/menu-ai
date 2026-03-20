import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [input, setInput] = useState('egg, rice, garlic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const ingredients = input
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      const response = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, language: 'en' })
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError('Cannot reach the API. Please check the backend service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-[#1f1b16]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a6f63]">
            Recipe matcher
          </p>
          <h1 className="text-4xl font-semibold">Menu ideas from your ingredients</h1>
          <p className="max-w-2xl text-base text-[#7a6f63]">
            Type the ingredients you have, and the API will return the best matching recipes.
          </p>
        </header>

        <section className="rounded-3xl border border-[#e6dac8] bg-white/70 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-sm font-semibold">Ingredients (comma separated)</label>
            <textarea
              className="h-28 w-full resize-none rounded-2xl border border-[#e6dac8] bg-white px-4 py-3 text-sm"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#e4572e] px-5 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                {loading ? 'Loading...' : 'Recommend'}
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Results</h2>
          {results.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[#e6dac8] bg-white/60 px-4 py-3 text-sm text-[#7a6f63]">
              No results yet. Run a search to see recommendations.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((item) => (
              <article key={item.id} className="rounded-2xl border border-[#e6dac8] bg-white p-4">
                <h3 className="text-lg font-semibold">{item.name_en || item.name_th}</h3>
                <p className="text-sm text-[#e4572e]">Score: {item.score}</p>
                <p className="mt-2 text-sm text-[#7a6f63]">
                  {item.ai_reason || 'A solid match based on your ingredients.'}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
