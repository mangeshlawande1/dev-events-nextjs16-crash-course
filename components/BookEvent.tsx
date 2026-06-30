'use client';
import { useState } from "react"


const BookEvent = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();// prevent default bahaviour of the browser to reload 

        setTimeout(()=> { 
            setSubmitted(true)
        }, 1000)
    }
  return (
    <div id="book-event">
        {submitted ? (
            <p className="text-sm">
                Thank you For signing up !
            </p>
        ) : (
           <form onSubmit={handleSubmit}>
            <div >
                <label htmlFor="email">Email Address</label>
                <input 
                type="email" 
                value={email} 
                onChange={ (e) => setEmail(e.target.value)}
                id="email"
                placeholder="Enter Your email address" />
            </div>
            <button className="button-submit" type="submit"> Submit </button>
           </form>
        ) }
    </div>
  )
}

export default BookEvent