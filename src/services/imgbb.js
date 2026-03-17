function dataURLtoBlob(dataURL) {
  const [meta, base64] = dataURL.split(",")
  const mime = meta.match(/:(.*?);/)[1]
  const bin = atob(base64)
  const len = bin.length
  const arr = new Uint8Array(len)
  for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

// Resize image to max dimension before upload — keeps quality, reduces file size
async function resizeImage(dataURL, maxDim = 1920) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width  * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement("canvas")
      canvas.width  = w
      canvas.height = h
      canvas.getContext("2d").drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL("image/jpeg", 0.82))
    }
    img.src = dataURL
  })
}

async function uploadOnce(blob, key) {
  const formData = new FormData()
  formData.append("image", blob)

  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 30000) // 30s timeout

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: formData,
    signal: controller.signal
  })

  clearTimeout(t)
  if (!res.ok) throw new Error("Upload failed")

  const data = await res.json()
  return data.data.url
}

export async function uploadImage(dataURL) {
  const API_KEY = "f064aba30dfa4329fd9632c821880b1c"

  // Resize down to 1920px max before upload — much faster, still looks great on phone
  const resized = await resizeImage(dataURL, 1920)
  const blob = dataURLtoBlob(resized)

  for (let i = 0; i < 2; i++) {
    try {
      return await uploadOnce(blob, API_KEY)
    } catch (e) {
      if (i === 1) throw e
    }
  }
}