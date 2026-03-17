import { motion } from "framer-motion"
import frame1 from "../assets/Frame 1.png"

export default function Home({ onSelect }) {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      position: 'relative', overflow: 'hidden',
      background: '#0a1e4a'
    }}>

      {/* Frame 1 full bleed */}
      <img src={frame1} style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center',
        zIndex: 0
      }} alt="" />

      {/* PHOTO EXPERIENCE — sits just below the 1664 text in the image */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{
          position: 'absolute', top: '22%',
          left: 0, right: 0, textAlign: 'center', zIndex: 5
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '1px', background: 'rgba(201,168,76,0.7)' }} />
          <span style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '9px', fontWeight: 600,
            letterSpacing: '6px', color: '#f0d080',
            textTransform: 'uppercase'
          }}>PHOTO EXPERIENCE</span>
          <div style={{ width: '28px', height: '1px', background: 'rgba(201,168,76,0.7)' }} />
        </div>
      </motion.div>

      {/* Invisible clickable zone over the baked-in START button */}
      <motion.div
        whileTap={{ opacity: 0.6 }}
        onClick={onSelect}
        style={{
          position: 'absolute',
          bottom: '5%', left: '20%',
          width: '60%', height: '10%',
          zIndex: 10, cursor: 'pointer',
          borderRadius: '4px', background: 'transparent'
        }}
      />

    </div>
  )
}