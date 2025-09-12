import useSWR from 'swr'
import Link from 'next/link'

const fetcher = url => fetch(url).then(r=>r.json())

export default function Dashboard(){
  const { data: upcoming } = useSWR('/api/events?status=confirmed', fetcher)
  const { data: inDev } = useSWR('/api/events?status=idea', fetcher)
  const { data: archived } = useSWR('/api/events?status=archived', fetcher)

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div style={{marginBottom:12}}>
        <Link href="/events/new"><button className="btn">Create Event</button></Link>
        <Link href="/events"><button className="btn secondary" style={{marginLeft:8}}>Search Events</button></Link>
      </div>

      <h2>Upcoming Events</h2>
      <div className="card">{upcoming ? upcoming.length ? upcoming.map(e=> <div key={e.id}><Link href={`/events/${e.id}`}><a>{e.title} — {e.date}</a></Link></div>) : 'No upcoming' : 'Loading...'}</div>

      <h2>In Development</h2>
      <div className="card">{inDev ? inDev.length ? inDev.map(e=> <div key={e.id}><Link href={`/events/${e.id}`}><a>{e.title} — {e.status}</a></Link></div>) : 'No events' : 'Loading...'}</div>

      <h2>Archived</h2>
      <div className="card">{archived ? archived.length ? archived.map(e=> <div key={e.id}><Link href={`/events/${e.id}`}><a>{e.title} — {e.date}</a></Link></div>) : 'No archived' : 'Loading...'}</div>
    </div>
  )
}
