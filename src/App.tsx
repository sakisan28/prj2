import { useState, useEffect } from 'react'
import { Plus, Minus, RotateCcw, Smartphone, Sparkles, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function App() {
  const [val1, setVal1] = useState<number>(1)
  const [val2, setVal2] = useState<number>(1)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  // Recalculate immediately (computed property)
  const result = val1 + val2

  useEffect(() => {
    // Listen for PWA installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
  }

  const handleInputChange = (index: 1 | 2, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10)
    if (isNaN(numericValue)) return
    
    // Set a reasonable limit to prevent performance/render issues
    const safeValue = Math.max(0, Math.min(numericValue, 1000))

    if (index === 1) {
      setVal1(safeValue)
    } else {
      setVal2(safeValue)
    }
  }

  const handleStep = (index: 1 | 2, amount: number) => {
    if (index === 1) {
      setVal1(prev => Math.max(0, prev + amount))
    } else {
      setVal2(prev => Math.max(0, prev + amount))
    }
  }

  const handleReset = () => {
    setVal1(1)
    setVal2(1)
  }

  // Generate visual dots representation
  const renderDots = () => {
    const totalDots = val1 + val2
    if (totalDots === 0) {
      return <div className="visualizer-empty">No units to display</div>
    }

    if (totalDots > 200) {
      return (
        <div className="visualizer-empty" style={{ flexDirection: 'column', gap: '0.25rem' }}>
          <Sparkles size={24} className="text-purple-400" style={{ color: '#c084fc', marginBottom: '0.25rem' }} />
          <span>{totalDots} total items</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(Visualization hidden for speed)</span>
        </div>
      )
    }

    const dots = []
    for (let i = 0; i < val1; i++) {
      dots.push(<div key={`v1-${i}`} className="visual-dot first" />)
    }
    for (let i = 0; i < val2; i++) {
      dots.push(<div key={`v2-${i}`} className="visual-dot second" />)
    }
    return dots
  }

  return (
    <div className="app-card">
      <header className="app-header">
        <h1 className="app-title">Instant Sum</h1>
        <p className="app-subtitle">Real-time addition. Fast and simple.</p>
      </header>

      <main className="equation-container">
        <div className="inputs-row">
          {/* Input 1 */}
          <div className="input-wrapper">
            <span className="input-label first">Value A</span>
            <div className="number-input-container first">
              <input
                type="number"
                value={val1 === 0 && val1 !== null ? '' : val1}
                onChange={(e) => handleInputChange(1, e.target.value)}
                placeholder="0"
                className="number-input"
                min="0"
                max="1000"
              />
              <div className="spin-buttons">
                <button 
                  type="button" 
                  onClick={() => handleStep(1, -1)} 
                  className="spin-btn"
                  title="Decrease Value A"
                >
                  <Minus size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => handleStep(1, 1)} 
                  className="spin-btn"
                  title="Increase Value A"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="operator">
            <Plus size={20} />
          </div>

          {/* Input 2 */}
          <div className="input-wrapper">
            <span className="input-label second">Value B</span>
            <div className="number-input-container second">
              <input
                type="number"
                value={val2 === 0 && val2 !== null ? '' : val2}
                onChange={(e) => handleInputChange(2, e.target.value)}
                placeholder="0"
                className="number-input"
                min="0"
                max="1000"
              />
              <div className="spin-buttons">
                <button 
                  type="button" 
                  onClick={() => handleStep(2, -1)} 
                  className="spin-btn"
                  title="Decrease Value B"
                >
                  <Minus size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => handleStep(2, 1)} 
                  className="spin-btn"
                  title="Increase Value B"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="equals">=</div>

        {/* Recalculated Sum Result */}
        <div className="result-container">
          <div className="result-card pulse">
            <div className="result-value">{result}</div>
            <div className="result-label">Result Sum</div>
          </div>
        </div>
      </main>

      {/* Visual representation */}
      <section className="visualizer-section">
        <div className="visualizer-title">
          <Sparkles size={16} style={{ color: '#ec4899' }} />
          <span>Visual Representation</span>
        </div>
        <div className="visualizer-box">
          {renderDots()}
        </div>
      </section>

      {/* Control Actions */}
      <button 
        type="button" 
        onClick={handleReset} 
        className="spin-btn" 
        style={{ padding: '0.75rem', borderRadius: '14px', width: '100%', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)' }}
      >
        <RotateCcw size={16} />
        Reset Application
      </button>

      {/* PWA Install Promo Banner */}
      {installPrompt && !isInstalled && (
        <div className="pwa-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={18} />
            <span>Install on Home Screen</span>
          </div>
          <button type="button" onClick={handleInstallClick} className="pwa-install-btn">
            <Download size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Install
          </button>
        </div>
      )}

      {/* iOS App installation tips */}
      {!installPrompt && !isInstalled && (
        <div className="app-subtitle" style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}>
          <span>To install on iOS: Tap <span style={{ fontWeight: 'bold' }}>Share</span> then <span style={{ fontWeight: 'bold' }}>Add to Home Screen</span></span>
        </div>
      )}
    </div>
  )
}

export default App
