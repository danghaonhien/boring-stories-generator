import Generate from './pages/Generate'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <span className="h-8 w-8 rounded-full bg-black flex items-center justify-center mr-3">
              <span className="text-white text-xs font-bold">BD</span>
            </span>
            <h1 className="text-xl font-bold text-gray-900">The Boring Dev</h1>
          </div>
          <div className="text-sm text-gray-500">Story Generator</div>
        </div>
      </header>
      <main className="py-6">
        <Generate />
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} The Boring Dev | Powered by GPT-3.5 Turbo
        </div>
      </footer>
    </div>
  )
}

export default App
