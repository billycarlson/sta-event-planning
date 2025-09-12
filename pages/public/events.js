import useSWR from 'swr'
import Link from 'next/link'
const fetcher = url => fetch(url).then(r=>r.json())

export default function PublicEvents(){
  const { data } = useSWR('/api/events?status=confirmed', fetcher)
  const now = new Date().toISOString().slice(0,10)
  const upcoming = (data || []).filter(e=> e.date >= now)
  return (
    <div className="container">
      <h1>Upcoming Events</h1>
      {upcoming.length ? upcoming.map(e=> <div key={e.id} className="card"><h3>{e.title}</h3><div>{e.date}</div><div>{e.description}</div><div><a href={`/rsvp/${e.id}`}>RSVP</a></div></div>) : 'No upcoming events' }
    </div>
  )
}
