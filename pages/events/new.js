import { useState } from 'react'
import Router from 'next/router'

export default function NewEvent(){
  const [form,setForm] = useState({title:'',description:'',date:'',time:'',location:'',type:'',status:'idea'})
  const submit = async e => {
    e.preventDefault()
    const res = await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    if (res.ok) { const ev = await res.json(); Router.push(`/events/${ev.id}`) }
  }
  return (
    <div className="container">
      <h1>Create Event</h1>
      <form onSubmit={submit} className="card">
        <label>Title</label>
        <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        <label>Description</label>
        <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <label>Date</label>
        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
        <label>Time</label>
        <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} />
        <label>Location</label>
        <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
        <label>Type</label>
        <input value={form.type} onChange={e=>setForm({...form,type:e.target.value})} />
        <label>Status</label>
        <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="idea">Idea</option><option value="in_development">In Development</option><option value="confirmed">Confirmed</option><option value="archived">Archived</option></select>
        <div style={{marginTop:8}}><button className="btn">Create</button></div>
      </form>
    </div>
  )
}
