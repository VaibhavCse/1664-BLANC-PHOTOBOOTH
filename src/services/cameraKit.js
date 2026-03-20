import { bootstrapCameraKit } from "@snap/camera-kit"

const API_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzczNDg0MDg3LCJzdWIiOiIxYWI5MGFjZi05ZmVkLTQzNDEtYmVkNS1jNzI2YTlhMDA4MjR-U1RBR0lOR344NmVjOTU3Zi1mMjFkLTQ2OTYtOWVkMy0yNGYwMWQ3YjEwN2IifQ.dyykvMlenEf1oUA1_Fx9o6D5znRco8kW5Pfut7kmUsc"
const LENS_GROUP = "1d418315-4d99-45ce-8913-68107d39255f"

let _kit       = null
let _session   = null
let _stream    = null
let _canvas    = null
let _rafId     = null
let _offscreen = null

export async function initCamera(container) {
  _killAll()

  if (!_kit) {
    _kit = await bootstrapCameraKit({ apiToken: API_TOKEN })
  }

  _stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false
  })

  const rawVideo = document.createElement("video")
  rawVideo.srcObject = _stream
  rawVideo.autoplay = true
  rawVideo.playsInline = true
  rawVideo.muted = true
  await new Promise(resolve => { rawVideo.onloadedmetadata = () => resolve() })
  await rawVideo.play()

  _offscreen = document.createElement("canvas")
  _offscreen.width  = rawVideo.videoWidth  || 1280
  _offscreen.height = rawVideo.videoHeight || 720
  const ctx = _offscreen.getContext("2d", { alpha: false, willReadFrequently: false })

  // 24fps cap — enough for photobooth, cuts CPU/GPU load by ~60%
  const TARGET_FPS = 24
  let _lastFrameTime = 0

  function drawFlipped(timestamp) {
    if (!_offscreen) return
    _rafId = requestAnimationFrame(drawFlipped)
    if (timestamp - _lastFrameTime < 1000 / TARGET_FPS) return
    _lastFrameTime = timestamp
    ctx.save()
    ctx.translate(_offscreen.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(rawVideo, 0, 0, _offscreen.width, _offscreen.height)
    ctx.restore()
  }
  drawFlipped(0)

  const flippedStream = _offscreen.captureStream(TARGET_FPS)

  if (!_session) {
    _session = await _kit.createSession()
  }

  await _session.setSource(flippedStream)

  if (_canvas) {
    try { _canvas.parentNode?.removeChild(_canvas) } catch {}
  }
  _canvas = _session.output.live
  _canvas.style.cssText = `
    position:absolute;top:0;left:0;
    width:100%;height:100%;
    object-fit:cover;z-index:2;pointer-events:none;
  `
  container.appendChild(_canvas)
  await _session.play()

  return { canvas: _canvas }
}

export async function applyLens(lensId) {
  if (!_session || !_kit) return
  const lens = await _kit.lensRepository.loadLens(lensId, LENS_GROUP)
  await _session.applyLens(lens)
}

export function suspendCamera() {
  _killAll()
}

function _killAll() {
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null }
  _offscreen = null
  try { _session?.pause() } catch {}
  if (_canvas) {
    try { _canvas.parentNode?.removeChild(_canvas) } catch {}
  }
  if (_stream) {
    _stream.getTracks().forEach(t => { try { t.enabled = false; t.stop() } catch {} })
    _stream = null
  }
  try {
    document.querySelectorAll('video').forEach(v => {
      if (v.srcObject) {
        v.srcObject.getTracks().forEach(t => { try { t.stop() } catch {} })
        v.srcObject = null
      }
    })
  } catch {}
}