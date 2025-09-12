import useSWR from 'swr'
import Link from 'next/link'
import { useState } from 'react'

const fetcher = url => fetch(url).then(r=>r.json())

export default function Events(){
  const [q,setQ] = useState('')
  const { data } = useSWR('/api/events', fetcher)
  const list = data || []
  const filtered = list.filter(e=> e.title.toLowerCase().includes(q.toLowerCase()) )
  return (
    <div className="container">
      <h1>Events</h1>
      <div style={{marginBottom:12}}>
        <input placeholder="search" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <div className="card">
        {filtered.map(ev => (
          <div key={ev.id}><Link href={`/events/${ev.id}`}><a>{ev.title} — {ev.status} — {ev.date}</a></Link></div>
        ))}
      </div>
    </div>
  )
}
