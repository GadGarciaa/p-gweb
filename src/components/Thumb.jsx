import { resolveImageUrl } from '../api.js'

// Caja de imagen reusada en tarjetas, hero y detalle: muestra la foto real
// del producto si existe, o el placeholder "Imagen" si todavia no tiene una.
export default function Thumb({ src, className = '', label = 'Imagen' }) {
  const url = resolveImageUrl(src)
  return (
    <div className={`${className} ${url ? 'has-image' : ''}`.trim()}>
      {url ? <img src={url} alt="" /> : <span>{label}</span>}
    </div>
  )
}
