import { useRouter } from 'next/router'

export default function RSVP(){
  const router = useRouter(); const { id } = router.query
  return (
    <div className="container">
      <h1>RSVP for Event #{id}</h1>
      <p>This is a placeholder RSVP page. Integrate with real RSVP form or external service.</p>
    </div>
  )
}
