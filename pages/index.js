import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = url => fetch(url).then(r => r.json())

export default function Dashboard() {
  const [filters, setFilters] = useState({ start: '', end: '', category: '' })

  const { data: categories } = useSWR('/api/events/categories', fetcher)

  const qs = new URLSearchParams()
  if (filters.start) qs.append('start', filters.start)
  if (filters.end) qs.append('end', filters.end)
  if (filters.category) qs.append('category', filters.category)
  const { data: events } = useSWR(`/api/events${qs.toString() ? '?' + qs.toString() : ''}`, fetcher)

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div style={{marginBottom:12}}>
        <Link href="/events/new"><button className="btn">Create Event</button></Link>
        <Link href="/events"><button className="btn secondary" style={{marginLeft:8}}>Search Events</button></Link>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <label style={{marginRight:8}}>Start Date <input type="date" value={filters.start} onChange={e => setFilters({ ...filters, start: e.target.value })} /></label>
        <label style={{marginRight:8}}>End Date <input type="date" value={filters.end} onChange={e => setFilters({ ...filters, end: e.target.value })} /></label>
        <label>Category
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All</option>
            {categories && categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <div className="card">
        {events ? events.length ? (
          <table style={{width:'100%'}}>
            <thead><tr><th>Date</th><th>Title</th><th>Category</th></tr></thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td><Link href={`/events/${e.id}`}><a>{e.title}</a></Link></td>
                  <td>{e.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : 'No events found' : 'Loading...'}
      </div>
    </div>
  )
}
