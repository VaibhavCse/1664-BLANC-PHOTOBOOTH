import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Countdown from "./Countdown"
import { initCamera, applyLens, suspendCamera } from "../services/cameraKit"
import icon1 from "../assets/icon1.png"
import icon2 from "../assets/icon2.png"
import icon3 from "../assets/icon3.png"
import icon4 from "../assets/icon4.png"

const FILTERS = [
  { title: "Le Scarf",     lensId: "650ee0c5-6451-4a2e-9706-ca0ec8c443b9", icon: icon1 },
  { title: "La Beret",     lensId: "d1f9eb4b-e1f5-49d0-8507-ddd66061c975", icon: icon2 },
  { title: "Les Lunettes", lensId: "7d84f935-6d66-42ac-b1da-ec78dc538320", icon: icon3 },
  { title: "1664 Blanc",   lensId: "30e5583c-cf28-4ff8-bd3a-0c64a50171cc", icon: icon4 },
]

export default function CameraScreen({ onCapture }) {
  const containerRef = useRef(null)
  const mountedRef   = useRef(true)
  const touchStartX  = useRef(null)

  const [activeIdx, setActiveIdx] = useState(0)
  const [counting,  setCounting]  = useState(false)
  const [lensReady, setLensReady] = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [switching, setSwitching] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [bgEnabled, setBgEnabled] = useState(true)

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

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return
    if (dx < 0) switchFilter(Math.min(activeIdx + 1, FILTERS.length - 1))
    else        switchFilter(Math.max(activeIdx - 1, 0))
  }

  function handleCanvasTap(e) {
    // Don't fire if tapping the bottom controls (icons, buttons)
    if (e.target.closest && e.target.closest('[data-controls]')) return
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'IMG') return
    // Don't fire if this was triggered by our own dispatched event
    if (e.target.tagName === 'CANVAS') return
    if (!lensReady) return

    // Toggle bg state
    setBgEnabled(prev => !prev)

    // Forward a real click into the Snap canvas so the lens receives it
    const snapCanvas = containerRef.current?.querySelector("canvas")
    if (!snapCanvas) return

    const rect = snapCanvas.getBoundingClientRect()
    const clientX = e.clientX ?? (e.touches?.[0]?.clientX ?? rect.left + rect.width / 2)
    const clientY = e.clientY ?? (e.touches?.[0]?.clientY ?? rect.top  + rect.height / 2)

    // Dispatch both mousedown and click so lens runtime catches it
    ;["mousedown", "mouseup", "click"].forEach(type => {
      snapCanvas.dispatchEvent(new MouseEvent(type, {
        bubbles: true, cancelable: true,
        clientX, clientY,
        view: window
      }))
    })
  }

  function startCountdown() {
    if (!lensReady || capturing || counting || switching) return
    setCounting(true)
  }

  async function takePhoto() {
    if (capturing) return
    const snapCanvas = containerRef.current?.querySelector("canvas")
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
      onClick={handleCanvasTap}
      style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}
    >

      <AnimatePresence>
        {(loading || switching) && (
          <motion.div key="loader"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff", background: "rgba(10,30,74,0.85)",
              padding: "12px 24px", borderRadius: "40px",
              fontFamily: "'Montserrat',sans-serif",
              fontSize: "10px", fontWeight: 600,
              letterSpacing: "4px", textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)", zIndex: 50, pointerEvents: "none"
            }}>
            <span style={{ display: "inline-block" }}>{switching ? "Switching..." : "Loading..."}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {counting && (
        <Countdown onComplete={() => {
          setTimeout(() => { takePhoto(); setCounting(false) }, 150)
        }} />
      )}

      <div style={{
        position: "absolute", bottom: "68px", left: 0, right: 0,
        zIndex: 10, pointerEvents: "all",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"
      }}>
        <AnimatePresence mode="wait">
          <motion.p key={activeIdx}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "16px", fontWeight: 600, color: "#fff",
              letterSpacing: "4px", textTransform: "uppercase",
              textShadow: "0 2px 16px rgba(0,0,0,1)",
              margin: 0, pointerEvents: "none"
            }}>
            {FILTERS[activeIdx].title}
          </motion.p>
        </AnimatePresence>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          {FILTERS.map((f, i) => {
            const isActive = i === activeIdx
            const size = isActive ? 68 : Math.abs(i - activeIdx) === 1 ? 50 : 40
            return (
              <motion.button key={i}
                onClick={() => isActive ? startCountdown() : switchFilter(i)}
                whileTap={{ scale: 0.85 }}
                style={{
                  width: `${size}px`, height: `${size}px`,
                  borderRadius: "50%", flexShrink: 0,
                  background: isActive ? "#fff" : "rgba(255,255,255,0.18)",
                  border: isActive
                    ? `3px solid ${canCapture ? "#c9a84c" : "rgba(255,255,255,0.4)"}`
                    : "2px solid rgba(255,255,255,0.2)",
                  boxShadow: isActive ? "0 0 0 4px rgba(201,168,76,0.35),0 4px 20px rgba(0,0,0,0.5)" : "none",
                  cursor: "pointer", padding: isActive ? "8px" : "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", opacity: isActive ? 1 : 0.65,
                  transition: "all 0.25s ease"
                }}>
                <img src={f.icon} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt={f.title} />
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}