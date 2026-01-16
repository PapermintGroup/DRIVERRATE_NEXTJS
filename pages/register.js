import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Register(){
  const [name,setName]=useState(''); 
  const [email,setEmail]=useState(''); 
  const [password,setPassword]=useState('');
  const router = useRouter();

  async function submit(e){
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify({name, email, password})
    });
    
    const j = await res.json();
    
    if(j.ok) { 
      router.push('/');  
    } else {
      alert(j.error || 'Error during registration');
    }
  }

  return (
    <div style={{maxWidth: 400, margin: '80px auto', padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <h2 style={{color: '#2d9a4a', textAlign: 'center', marginBottom: '20px'}}>Create Account</h2>
      <form onSubmit={submit} style={{display: 'grid', gap: '15px'}}>
        <input 
          placeholder="Full Name" 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          required 
          style={inputStyle}
        />
        <input 
          placeholder="Email Address" 
          type="email"
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          required 
          style={inputStyle}
        />
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          required 
          style={inputStyle}
        />
        <button 
          style={{
            background: '#2d9a4a', 
            color: '#fff', 
            padding: '12px', 
            borderRadius: '6px', 
            border: 'none', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Register
        </button>
      </form>
      <p style={{textAlign: 'center', marginTop: '20px'}}>
        Already have an account? <a href="/login" style={{color: '#2d9a4a', textDecoration: 'none'}}>Login</a>
      </p>
    </div>
  )
}

const inputStyle = {
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '16px',
  outline: 'none'
};
