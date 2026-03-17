import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import frame15 from "../assets/Frame 15.png"

const AUTO_RESET = 30

export default function QRScreen({ image, viewerUrl, onReset }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_RESET)
  const shouldReset = useRef(false)
  const qrTarget = viewerUrl || image

  useEffect(() => {
    shouldReset.current = false
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { shouldReset.current = true; clearInterval(interval); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (countdown === 0 && shouldReset.current) onReset()
  }, [countdown])

  return (
    <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{
      width: "100vw", height: "100vh",
      position: "relative", overflow: "hidden",
      background: "#1a3a9f",
      display: "flex", justifyContent: "center"
    }}>
      <div style={{
        position: "relative",
        width: "min(100vw, 56.25vh)",
        height: "min(100vh, 177.78vw)",
        flexShrink: 0
      }}>
        <img src={frame15} style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          zIndex: 0
        }} alt="" />

        {/* Photo card — top:22%, height:54%, so bottom edge = 76% */}
        <div style={{
          position: "absolute",
          top: "22%", left: "13%",
          width: "74%", height: "54%",
          borderRadius: "20px",
          overflow: "hidden",
          zIndex: 3,
          background: "#c8d4e8",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {!imgLoaded && (
            <div style={{
              width: "36px", height: "36px",
              border: "3px solid rgba(255,255,255,0.35)",
              borderTopColor: "#ffffff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              flexShrink: 0
            }} />
          )}
          {image && (
            <img src={image} onLoad={() => setImgLoaded(true)} style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
              display: "block",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.5s"
            }} alt="" />
          )}
        </div>

        {/* QR circle — top:70% so it overlaps the bottom of photo (which ends at 76%) */}
        <div style={{
          position: "absolute",
          top: "70%", left: "50%",
          transform: "translate(-50%, 0)",
          width: "24%", aspectRatio: "1",
          background: "#fff", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 0 5px #fff, 0 0 0 8px rgba(201,168,76,0.5), 0 10px 30px rgba(0,0,0,0.4)",
          zIndex: 5, overflow: "hidden"
        }}>
          {qrTarget ? (
            <QRCodeSVG value={qrTarget} style={{ width: "78%", height: "78%" }} bgColor="#ffffff" fgColor="#0a1e4a" />
          ) : (
            <div style={{
              width: "16px", height: "16px",
              border: "2px solid #0a1e4a", borderTopColor: "transparent",
              borderRadius: "50%", animation: "spin 0.8s linear infinite"
            }} />
          )}
        </div>

        {/* Countdown */}
        <div style={{
          position: "absolute", top: "2%", left: "5%",
          fontFamily: "'Montserrat',sans-serif",
          fontSize: "11px", letterSpacing: "2px",
          color: "rgba(255,255,255,0.6)", zIndex: 10
        }}>{countdown}s</div>

        {/* X hit zone */}
        <div onClick={onReset} style={{
          position: "absolute",
          top: "11%", left: "50%",
          transform: "translateX(-50%)",
          width: "14%", height: "7%",
          zIndex: 10, cursor: "pointer",
          borderRadius: "50%"
        }} />
      </div>
    </div>
    </>
  )
}