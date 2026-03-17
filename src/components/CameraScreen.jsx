import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Countdown from "./Countdown"
import { initCamera, applyLens, suspendCamera } from "../services/cameraKit"
import BottomBar from "./BottomBar"
import icon1 from "../assets/icon1.png"
import icon2 from "../assets/icon2.png"
import icon3 from "../assets/icon3.png"
import icon4 from "../assets/icon4.png"

const FILTERS = [
  { title: "Le Scarf",     lensId: "b0348dd6-6411-4365-9973-36a5243be3de", icon: icon1 },
  { title: "La Beret",     lensId: "ee60eb23-9a1a-45f8-9a8b-5c94ea146277", icon: icon2 },
  { title: "Les Lunettes", lensId: "33bf5116-f2b1-4282-a297-3f43e041028c", icon: icon3 },
  { title: "1664 Blanc",   lensId: "fedd8543-0170-4194-b825-c4dd72f99287", icon: icon4 },
]

export default function CameraScreen({ onCapture }) {
  const containerRef = useRef(null)
  const mountedRef   = useRef(true)
  const touchStartX  = useRef(null)   // ← swipe tracking

  const [activeIdx, setActiveIdx] = useState(0)
  const [counting,  setCounting]  = useState(false)
  const [lensReady, setLensReady] = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [switching, setSwitching] = useState(false)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    init()
    return () => { mountedRef.current = false; suspendCamera() }
  }, [])

  async function init() {
    setLoading(true); setLensReady(false)
    try {
      await initCamera(containerRef.current)
      await applyLens(FILTERS[0].lensId)
      if (mountedRef.current) { setLensReady(true); setLoading(false) }
    } catch (e) {
      console.error("Camera init error:", e)
      if (mountedRef.current) setLoading(false)
    }
  }

  async function switchFilter(idx) {
    if (idx === activeIdx || switching || !lensReady) return
    setSwitching(true); setActiveIdx(idx)
    try { await applyLens(FILTERS[idx].lensId) } catch (e) { console.error(e) }
    if (mountedRef.current) setSwitching(false)
  }

  // ── Swipe handlers ──────────────────────────────
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return          // too short, ignore
    if (dx < 0) switchFilter(Math.min(activeIdx + 1, FILTERS.length - 1))  // swipe left → next
    else        switchFilter(Math.max(activeIdx - 1, 0))                    // swipe right → prev
  }
  // ────────────────────────────────────────────────

  function startCountdown() {
    if (!lensReady || capturing || counting || switching) return
    setCounting(true)
  }

  async function takePhoto() {
    if (capturing) return
    const snapCanvas = containerRef.current?.querySelector('canvas')
    if (!snapCanvas) return
    setCapturing(true)
    try {
      const srcW = snapCanvas.width  || snapCanvas.offsetWidth
      const srcH = snapCanvas.height || snapCanvas.offsetHeight
      const tgtW = 2160, tgtH = 3840
      const tgtRatio = tgtW / tgtH
      const srcRatio = srcW / srcH
      const exp = document.createElement("canvas")
      exp.width = tgtW; exp.height = tgtH
      const ctx = exp.getContext("2d")
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, tgtW, tgtH)
      let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH
      if (srcRatio > tgtRatio) { cropW = srcH * tgtRatio; cropX = (srcW - cropW) / 2 }
      else                     { cropH = srcW / tgtRatio; cropY = (srcH - cropH) / 2 }
      ctx.drawImage(snapCanvas, cropX, cropY, cropW, cropH, 0, 0, tgtW, tgtH)
      const dataURL = exp.toDataURL("image/jpeg", 0.75)
      suspendCamera()
      onCapture(dataURL)
    } catch (err) {
      console.error("Capture failed:", err)
      setCapturing(false)
    }
  }

  const canCapture = lensReady && !capturing && !counting && !switching

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#000' }}
    >

      <BottomBar />

      <AnimatePresence>
        {(loading || switching) && (
          <motion.div key="loader"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              color: '#fff', background: 'rgba(10,30,74,0.85)',
              padding: '12px 24px', borderRadius: '40px',
              fontFamily: "'Montserrat',sans-serif",
              fontSize: '10px', fontWeight: 600,
              letterSpacing: '4px', textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)', zIndex: 50, pointerEvents: 'none'
            }}>
            {switching ? 'Switching...' : 'Loading...'}
          </motion.div>
        )}
      </AnimatePresence>

      {counting && (
        <Countdown onComplete={() => {
          setTimeout(() => { takePhoto(); setCounting(false) }, 150)
        }} />
      )}

      {/* Controls above bottom bar */}
      <div style={{
        position: 'absolute', bottom: '130px', left: 0, right: 0,
        zIndex: 10, pointerEvents: 'all',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
      }}>
        <AnimatePresence mode="wait">
          <motion.p key={activeIdx}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '16px', fontWeight: 600, color: '#fff',
              letterSpacing: '4px', textTransform: 'uppercase',
              textShadow: '0 2px 16px rgba(0,0,0,1)',
              margin: 0, pointerEvents: 'none'
            }}>
            {FILTERS[activeIdx].title}
          </motion.p>
        </AnimatePresence>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          {FILTERS.map((f, i) => {
            const isActive = i === activeIdx
            const size = isActive ? 68 : Math.abs(i - activeIdx) === 1 ? 50 : 40
            return (
              <motion.button key={i}
                onClick={() => isActive ? startCountdown() : switchFilter(i)}
                whileTap={{ scale: 0.85 }}
                style={{
                  width: `${size}px`, height: `${size}px`,
                  borderRadius: '50%', flexShrink: 0,
                  background: isActive ? '#fff' : 'rgba(255,255,255,0.18)',
                  border: isActive
                    ? `3px solid ${canCapture ? '#c9a84c' : 'rgba(255,255,255,0.4)'}`
                    : '2px solid rgba(255,255,255,0.2)',
                  boxShadow: isActive ? '0 0 0 4px rgba(201,168,76,0.35),0 4px 20px rgba(0,0,0,0.5)' : 'none',
                  cursor: 'pointer', padding: isActive ? '8px' : '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', opacity: isActive ? 1 : 0.65,
                  transition: 'all 0.25s ease'
                }}>
                <img src={f.icon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={f.title} />
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}