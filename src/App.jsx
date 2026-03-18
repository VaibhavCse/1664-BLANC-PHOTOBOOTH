import { useState } from "react"
import Home from "./pages/Home"
import CameraScreen from "./components/CameraScreen"
import QRScreen from "./components/QRScreen"
import { uploadImage } from "./services/imgbb"
import { suspendCamera } from "./services/cameraKit"

function App() {
  const [screen,     setScreen]     = useState("home")
  const [image,      setImage]      = useState(null)
  const [viewerUrl,  setViewerUrl]  = useState(null)
  const [uploading,  setUploading]  = useState(false)
  const [error,      setError]      = useState(null)

  async function handleCapture(img) {
    try {
      setUploading(true)
      setError(null)
      const result = await uploadImage(img)
      const imageUrl = typeof result === "string" ? result : result?.url
      const viewer   = typeof result === "string" ? result : (result?.viewerUrl || result?.url)
      if (!imageUrl) throw new Error("No URL returned")
      setImage(imageUrl)
      setViewerUrl(viewer)
      setScreen("qr")
    } catch (err) {
      setError("Upload failed. Please try again.")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  function handleReset() {
    suspendCamera()
    window.location.reload()
  }

  if (uploading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
        background: 'linear-gradient(180deg,#0a1e4a,#1a3a8f)',
        color: '#fff', fontFamily: "'Montserrat',sans-serif",
        fontSize: '11px', letterSpacing: '5px', textTransform: 'uppercase'
      }}>
        <div style={{
          width: '32px', height: '32px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTopColor: '#f0d080', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        Preparing your photo...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '20px',
        background: '#0a1e4a', color: '#fff',
        fontFamily: "'Montserrat',sans-serif"
      }}>
        <p style={{ letterSpacing: '2px', fontSize: '13px' }}>{error}</p>
        <button onClick={handleReset} style={{
          padding: '12px 28px', borderRadius: '40px',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'transparent', color: '#fff',
          fontSize: '11px', letterSpacing: '3px',
          cursor: 'pointer', fontFamily: "'Montserrat',sans-serif"
        }}>RESTART</button>
      </div>
    )
  }

  if (screen === "home")   return <Home onSelect={() => setScreen("camera")} />
  if (screen === "camera") return <CameraScreen onCapture={handleCapture} />
  if (screen === "qr")     return <QRScreen image={image} viewerUrl={viewerUrl} onReset={handleReset} onBack={() => setScreen("camera")} />

  return null
}

export default App