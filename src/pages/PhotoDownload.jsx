import { useState } from "react"
import { motion } from "framer-motion"

export default function PhotoDownload({ image }) {
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(image)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "1664blanc-photo.jpg"
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
    } catch {
      // Fallback — open in new tab
      window.open(image, "_blank")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;600;700&display=swap');
      * { margin:0; padding:0; box-sizing:border-box; }
      body { background:#0a1e4a; }
    `}</style>

    <div style={{
      width: '100vw', minHeight: '100vh',
      background: 'linear-gradient(160deg,#0a1e4a 0%,#0d2a6e 50%,#0a1e4a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px',
      position: 'relative', overflow: 'hidden'
    }}>

      {/* Decorative blur orbs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(201,168,76,0.12) 0%,transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: '250px', height: '250px', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(30,60,160,0.4) 0%,transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '28px' }}
      >
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '38px', fontWeight: 700, color: '#fff',
          letterSpacing: '10px', textTransform: 'uppercase',
          textShadow: '0 0 40px rgba(201,168,76,0.3)'
        }}>1664 BLANC</div>
        <div style={{
          width: '50px', height: '1px',
          background: 'linear-gradient(90deg,transparent,#c9a84c,transparent)',
          margin: '10px auto'
        }} />
        <div style={{
          fontFamily: "'Montserrat',sans-serif",
          fontSize: '8px', letterSpacing: '5px', color: '#f0d080',
          textTransform: 'uppercase'
        }}>YOUR PHOTO EXPERIENCE</div>
      </motion.div>

      {/* Photo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55 }}
        style={{
          width: '100%', maxWidth: '340px',
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
          marginBottom: '28px', position: 'relative'
        }}
      >
        <img src={image} style={{
          width: '100%', height: 'auto',
          display: 'block'
        }} alt="Your 1664 Blanc photo" />

        {/* Gold corner accents */}
        {['top:0;left:0;borderTop', 'top:0;right:0;borderTop', 'bottom:0;left:0;borderBottom', 'bottom:0;right:0;borderBottom'].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            ...(i === 0 && { top: 0, left: 0, borderTop: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c' }),
            ...(i === 1 && { top: 0, right: 0, borderTop: '2px solid #c9a84c', borderRight: '2px solid #c9a84c' }),
            ...(i === 2 && { bottom: 0, left: 0, borderBottom: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c' }),
            ...(i === 3 && { bottom: 0, right: 0, borderBottom: '2px solid #c9a84c', borderRight: '2px solid #c9a84c' }),
            width: '20px', height: '20px', borderRadius: '2px'
          }} />
        ))}
      </motion.div>

      {/* Download button */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={handleDownload}
        disabled={downloading}
        style={{
          width: '100%', maxWidth: '340px',
          padding: '18px',
          background: done
            ? 'linear-gradient(90deg,#2a7a4a,#3a9a5a)'
            : 'linear-gradient(90deg,#c9a84c,#f0d080,#c9a84c)',
          backgroundSize: '200% auto',
          border: 'none', borderRadius: '50px',
          fontFamily: "'Montserrat',sans-serif",
          fontSize: '12px', fontWeight: 700,
          letterSpacing: '4px', color: '#0a1e4a',
          cursor: downloading ? 'wait' : 'pointer',
          boxShadow: done
            ? '0 6px 24px rgba(42,122,74,0.4)'
            : '0 8px 32px rgba(201,168,76,0.5)',
          transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}
      >
        {downloading ? (
          <>
            <div style={{
              width: '16px', height: '16px',
              border: '2px solid rgba(10,30,74,0.4)',
              borderTopColor: '#0a1e4a', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite'
            }} />
            SAVING...
          </>
        ) : done ? (
          '✓ SAVED TO PHONE'
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a1e4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            SAVE TO PHONE
          </>
        )}
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          fontFamily: "'Montserrat',sans-serif",
          fontSize: '9px', letterSpacing: '2px',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase', marginTop: '20px',
          textAlign: 'center'
        }}
      >
        1664 Blanc · Photo Experience
      </motion.p>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
    </>
  )
}