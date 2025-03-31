import Generate from './pages/Generate'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">The Boring Dev - Story Generator</h1>
        </div>
      </header>
      <main>
        <Generate />
      </main>
    </div>
  )
}

export default App
