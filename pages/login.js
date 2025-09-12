import { useState } from 'react'
import Router from 'next/router'

export default function Login() {
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const submit = async e => {
    e.preventDefault()
    const res = await fetch('/api/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password }) })
    if (res.ok) Router.push('/')
    else setErr('Invalid')
  }
  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={submit}>
        <div className="card">
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div style={{marginTop:8}}>
            <button className="btn">Login</button>
            {err && <span style={{color:'red', marginLeft:8}}>{err}</span>}
          </div>
        </div>
      </form>
    </div>
  )
}
