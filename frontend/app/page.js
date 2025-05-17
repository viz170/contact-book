'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [contacts, setContacts] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/contacts')
      setContacts(res.data)
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  const addContact = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Both fields are required.')
      return
    }
    if (!email.includes('@')) {
      setError('Enter a valid email.')
      return
    }

    try {
      setLoading(true)
      await axios.post('http://localhost:8000/contacts', { name, email })
      setName('')
      setEmail('')
      setError('')
      fetchContacts()
    } catch (err) {
      console.error('Add error:', err)
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const deleteContact = async (emailToDelete) => {
    try {
      await axios.delete(`http://localhost:8000/contacts/${encodeURIComponent(emailToDelete)}`)
      fetchContacts()
    } catch (err) {
      console.error('Delete error:', err.respone || err.message || err)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  return (
    <main style={styles.container}>
      <h1 style={styles.heading}>📘 Contact Book</h1>

      <div style={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={addContact}
          style={{
            ...styles.button,
            backgroundColor: loading ? '#999' : '#0070f3',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>

      <section style={styles.listSection}>
        <h2 style={styles.subHeading}>Saved Contacts</h2>

        {contacts.length === 0 ? (
          <p style={styles.emptyState}>No contacts yet. Add someone!</p>
        ) : (
          <ul style={styles.list}>
            {contacts.map((c, i) => (
              <li key={i} style={styles.card}>
                <div>
                  <p style={styles.name}>{c.name}</p>
                  <p style={styles.email}>{c.email}</p>
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteContact(c.email)}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'Segoe UI, sans-serif'
  },
  heading: {
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333'
  },
  subHeading: {
    fontSize: '1.2rem',
    color: '#555',
    marginBottom: '10px'
  },
  form: {
    display: 'grid',
    gap: '10px',
    marginBottom: '30px'
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  },
  button: {
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#0070f3',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none'
  },
  error: {
    color: 'crimson',
    fontSize: '0.9rem'
  },
  listSection: {
    marginTop: '20px'
  },
  list: {
    listStyle: 'none',
    padding: 0
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '10px'
  },
  name: {
    fontWeight: '600',
    fontSize: '1.1rem',
    color:"black"
  },
  email: {
    color: '#666',
    fontSize: '0.95rem'
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#d11a2a'
  },
  emptyState: {
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center'
  }
}