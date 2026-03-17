// Shared bottom bar component used on all 3 screens
// Uses Frame 4 image. If it clips, the CSS fallback beneath it still looks great.
import frame4 from "../assets/Frame 4.png"

export default function BottomBar() {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      zIndex: 3, pointerEvents: 'none'
    }}>
      <img
        src={frame4}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        alt=""
        onError={e => { e.target.style.display = 'none' }}
      />
    </div>
  )
}