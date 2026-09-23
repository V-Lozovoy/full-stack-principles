import { MapContainer, TileLayer } from 'react-leaflet'
import * as L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import icon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

// Дефолтна іконка маркера в dev дає 404: Leaflet шукає картинки за
// відносними шляхами, яких у збірці Vite немає. Підсовуємо імпортовані
// URL — це вже зроблено за вас, розбір граблів був на Л6.
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl: icon2xUrl, shadowUrl })

/**
 * TODO(4): мапа з маркерами нотаток - головна сторінка застосунку.
 *
 * Дані візьміть із уже готового хука (крок 3):
 *
 *   const { data, isPending, isError, error } = useNotes()
 *
 * і всередині MapContainer, після TileLayer, розкладіть маркери:
 *
 *   {data?.items.map((note) => (
 *     <Marker key={note.id} position={[note.lat, note.lng]}>
 *       <Popup>
 *         <Link to={`/notes/${note.id}`}>{note.title}</Link>
 *       </Popup>
 *     </Marker>
 *   ))}
 *
 * Стани - ті самі, що й у списку: поки isPending - «Завантаження…»
 * над мапою, при isError - текст помилки. Клік по маркеру відкриває
 * попап, а з нього - сторінку нотатки.
 *
 * Висоту контейнера вже задано в index.css (.map): Leaflet рахує
 * розміри сам, і без явної height мапа має нуль пікселів - «ніби
 * мапи й немає», хоч помилок теж жодної.
 */
export default function MapPage() {
  return (
    <div className="map">
      <MapContainer center={[48.4647, 35.0462]} zoom={13} className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* TODO(4): маркери нотаток тут */}
      </MapContainer>
    </div>
  )
}
