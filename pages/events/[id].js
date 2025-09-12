import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'

const fetcher = url => fetch(url).then(r=>r.json())

export default function EventDetail(){
  const router = useRouter(); const { id } = router.query
  const { data: event } = useSWR(id?`/api/events/${id}`:null, fetcher)
  const { data: notes } = useSWR(id?`/api/events/${id}/notes`:null, fetcher)
  const { data: tasks } = useSWR(id?`/api/events/${id}/tasks`:null, fetcher)
  const { data: media } = useSWR(id?`/api/events/${id}/media`:null, fetcher)
  const [noteText,setNoteText] = useState('')
  const [taskText,setTaskText] = useState('')
  const [driveLink,setDriveLink] = useState('')

  const addNote = async ()=>{
    await fetch(`/api/events/${id}/notes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ user_id:1, content:noteText })})
    setNoteText('')
  }
  const addTask = async ()=>{
    await fetch(`/api/events/${id}/tasks`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ description:taskText,status:'open' })})
    setTaskText('')
  }

  const addDriveLink = async ()=>{
    // allow pasting existing drive link
    await fetch(`/api/events/${id}/media`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ filename:driveLink, url:driveLink, file_type:'link', user_id:1 })})
    setDriveLink('')
  }

  const handleFile = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    const form = new FormData()
    form.append('file', f)
    const res = await fetch(`/api/events/${id}/media`, { method: 'POST', body: form })
    if (res.ok) { /* ideally revalidate media SWR */ }
  }

  return (
    <div className="container">
      {event ? (
        <>
          <h1>{event.title}</h1>
          <div className="card">
            <div>{event.description}</div>
            <div>{event.date} {event.time} — {event.location}</div>
            <div>Type: {event.type} — Status: {event.status}</div>
          </div>

          <h2>Notes</h2>
          <div className="card">
            {notes ? notes.map(n=> <div key={n.id}><b>{n.name}</b>: {n.content}</div>) : 'Loading...'}
            <div style={{marginTop:8}}>
              <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} />
              <button className="btn" onClick={addNote} style={{marginTop:8}}>Add Note</button>
            </div>
          </div>

          <h2>Tasks</h2>
          <div className="card">
            {tasks ? tasks.map(t=> <div key={t.id}><input type="checkbox" /> {t.description} — due {t.due_date}</div>) : 'Loading...'}
            <div style={{marginTop:8}}>
              <input value={taskText} onChange={e=>setTaskText(e.target.value)} placeholder="task description" />
              <button className="btn" onClick={addTask} style={{marginLeft:8}}>Add Task</button>
            </div>
          </div>

          <h2>Media</h2>
          <div className="card">
            <p>Upload files (handled server-side to Google Drive in integration step) or paste Drive link:</p>
            <input type="file" onChange={handleFile} />
            <div style={{marginTop:8}}>
              <input value={driveLink} onChange={e=>setDriveLink(e.target.value)} placeholder="https://drive.google.com/..." />
              <button className="btn" onClick={addDriveLink} style={{marginLeft:8}}>Add Link</button>
            </div>
            <div style={{marginTop:12}}>
              <h4>Files</h4>
              {media ? media.map(m => (
                <div key={m.id} style={{marginBottom:6}}>
                  {m.file_type && m.file_type.startsWith('image') ? (<img src={m.url} style={{maxWidth:200}} />) : (<a href={m.url || m.drive_url} target="_blank" rel="noreferrer">{m.filename || m.file_name}</a>)}
                </div>
              )) : 'Loading...'}
            </div>
          </div>
        </>
      ) : 'Loading...'}
    </div>
  )
}
