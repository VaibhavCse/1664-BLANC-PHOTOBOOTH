import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit"

const API_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzczNDg0MDg3LCJzdWIiOiIxYWI5MGFjZi05ZmVkLTQzNDEtYmVkNS1jNzI2YTlhMDA4MjR-U1RBR0lOR344NmVjOTU3Zi1mMjFkLTQ2OTYtOWVkMy0yNGYwMWQ3YjEwN2IifQ.dyykvMlenEf1oUA1_Fx9o6D5znRco8kW5Pfut7kmUsc"
const LENS_GROUP = "1d418315-4d99-45ce-8913-68107d39255f"

let _kit     = null
let _session = null
let _stream  = null
let _canvas  = null

export async function initCamera(container) {
  _killAll()

  if (!_kit) {
    _kit = await bootstrapCameraKit({ apiToken: API_TOKEN })
  }

  _stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
    audio: false
  })

  if (!_session) {
    _session = await _kit.createSession()
  }

  if (_canvas) {
    try { _canvas.parentNode?.removeChild(_canvas) } catch {}
  }

  const source = createMediaStreamSource(_stream, {
    cameraType: "front",
    disableMirroring: true
  })
  await _session.setSource(source)

  _canvas = _session.output.live
  _canvas.style.cssText = `
    position:absolute;top:0;left:0;
    width:100%;height:100%;
    object-fit:cover;z-index:2;pointer-events:none;
    transform:scaleX(-1);
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
  try { _session?.pause() } catch {}
  if (_canvas) {
    try { _canvas.parentNode?.removeChild(_canvas) } catch {}
  }
  if (_stream) {
    _stream.getTracks().forEach(t => { try { t.enabled = false; t.stop() } catch {} })
    _stream = null
  }
  if (typeof navigator !== 'undefined') {
    try {
      document.querySelectorAll('video').forEach(v => {
        if (v.srcObject) {
          v.srcObject.getTracks().forEach(t => { try { t.stop() } catch {} })
          v.srcObject = null
        }
      })
    } catch {}
  }
}