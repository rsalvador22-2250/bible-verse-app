import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaCopy, FaShare, FaMoon, FaSun, FaRandom, FaSearch, FaPlus, FaTrash } from 'react-icons/fa'
import './App.css'

function App() {
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)
  const [randomVerse, setRandomVerse] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newVerse, setNewVerse] = useState({
    book: '',
    chapter: '',
    verse: '',
    text: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [selectedBook, setSelectedBook] = useState('')
  const [copyMessage, setCopyMessage] = useState('')

  // Bible books list for API
  const bibleBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
    'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John',
    '3 John', 'Jude', 'Revelation'
  ]

  // Initial sample verses (para may laman agad)
  const initialVerses = [
    { id: 1, book: "John", chapter: 3, verse: 16, text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
    { id: 2, book: "Psalm", chapter: 23, verse: 1, text: "The Lord is my shepherd; I shall not want." },
    { id: 3, book: "Philippians", chapter: 4, verse: 13, text: "I can do all things through Christ who strengthens me." },
    { id: 4, book: "Jeremiah", chapter: 29, verse: 11, text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
    { id: 5, book: "Romans", chapter: 8, verse: 28, text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose." },
    { id: 6, book: "Joshua", chapter: 1, verse: 9, text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." },
    { id: 7, book: "Proverbs", chapter: 3, verse: 5, text: "Trust in the Lord with all your heart and lean not on your own understanding." },
    { id: 8, book: "Isaiah", chapter: 40, verse: 31, text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles." }
  ]

  // 🚀 LOAD ENTIRE BOOK FROM API (LIBU-LIBONG VERSES!)
  const fetchBibleVerses = async (book) => {
    setLoading(true)
    setError('')
    try {
      // TANDAAN: Walang ?verse_count=10 para makuha ang BUONG LIBRO!
      const response = await axios.get(`https://bible-api.com/${book}?translation=kjv`)
      
      if (response.data && response.data.verses) {
        const newVerses = response.data.verses.map((v, index) => ({
          id: Date.now() + index,
          book: response.data.reference || book,
          chapter: v.chapter || 1,
          verse: v.verse || 1,
          text: v.text || ''
        }))
        
        // Pinagsama ang luma at bagong verses
        setVerses([...verses, ...newVerses])
        setError(`✅ Success! Added ${newVerses.length} verses from the book of ${book}!`)
        setTimeout(() => setError(''), 5000)
      } else {
        setError('No verses found for this book. Try another one.')
      }
    } catch (err) {
      setError('Error fetching book. Please try again.')
      console.error(err)
    }
    setLoading(false)
  }

  // AUTO-LOAD NG MGA SIKAT NA LIBRO SA UNANG BUKAS (para marami agad!)
  useEffect(() => {
    const savedVerses = localStorage.getItem('bibleVerses')
    const savedDarkMode = localStorage.getItem('darkMode')
    
    if (savedVerses) {
      // Kung may saved na, gamitin yun
      setVerses(JSON.parse(savedVerses))
      setLoading(false)
    } else {
      // Wala pang saved, auto-load ng 3 libro para "bible phone" na agad!
      const loadInitialBooks = async () => {
        const booksToLoad = ['John', 'Psalms', 'Genesis']
        let allVerses = [...initialVerses] // magsimula sa sample verses
        
        for (let book of booksToLoad) {
          try {
            const response = await axios.get(`https://bible-api.com/${book}?translation=kjv`)
            if (response.data && response.data.verses) {
              const newVerses = response.data.verses.map((v, index) => ({
                id: Date.now() + index + allVerses.length,
                book: response.data.reference || book,
                chapter: v.chapter || 1,
                verse: v.verse || 1,
                text: v.text || ''
              }))
              allVerses = [...allVerses, ...newVerses]
            }
          } catch (err) {
            console.error(`Failed to load ${book}`)
          }
        }
        setVerses(allVerses)
        localStorage.setItem('bibleVerses', JSON.stringify(allVerses))
        setLoading(false)
      }
      loadInitialBooks()
    }
    
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (verses.length > 0) {
      localStorage.setItem('bibleVerses', JSON.stringify(verses))
    }
  }, [verses])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  // Get random verse
  const getRandomVerse = () => {
    if (verses.length === 0) return
    const randomIndex = Math.floor(Math.random() * verses.length)
    setRandomVerse(verses[randomIndex])
  }

  // Copy to clipboard
  const copyToClipboard = (verse) => {
    const text = `"${verse.text}" — ${verse.book} ${verse.chapter}:${verse.verse}`
    navigator.clipboard.writeText(text).then(() => {
      setCopyMessage('📋 Copied!')
      setTimeout(() => setCopyMessage(''), 2000)
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopyMessage('📋 Copied!')
      setTimeout(() => setCopyMessage(''), 2000)
    })
  }

  // Share verse
  const shareVerse = async (verse) => {
    const text = `"${verse.text}" — ${verse.book} ${verse.chapter}:${verse.verse}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bible Verse',
          text: text,
          url: window.location.href
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    } else {
      copyToClipboard(verse)
      setCopyMessage('📋 Copied! Share it manually')
      setTimeout(() => setCopyMessage(''), 3000)
    }
  }

  // Add new verse
  const addVerse = (e) => {
    e.preventDefault()
    if (!newVerse.book || !newVerse.text) {
      setError('Please fill in all fields')
      return
    }
    
    const verse = {
      id: Date.now(),
      book: newVerse.book,
      chapter: parseInt(newVerse.chapter) || 1,
      verse: parseInt(newVerse.verse) || 1,
      text: newVerse.text
    }
    
    setVerses([...verses, verse])
    setNewVerse({ book: '', chapter: '', verse: '', text: '' })
    setShowAddForm(false)
    setError('✅ Verse added successfully!')
    setTimeout(() => setError(''), 3000)
  }

  // Delete verse
  const deleteVerse = (id) => {
    if (window.confirm('Are you sure you want to delete this verse?')) {
      setVerses(verses.filter(v => v.id !== id))
      setError('🗑️ Verse deleted')
      setTimeout(() => setError(''), 2000)
    }
  }

  // Search verses
  const filteredVerses = verses.filter(verse => {
    const search = searchTerm.toLowerCase()
    return verse.book.toLowerCase().includes(search) ||
           verse.text.toLowerCase().includes(search) ||
           verse.chapter.toString().includes(search)
  })

  // Get verse of the day
  const getVerseOfTheDay = () => {
    if (verses.length === 0) return null
    const day = new Date().getDate()
    const index = day % verses.length
    return verses[index]
  }

  const verseOfTheDay = getVerseOfTheDay()

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  if (loading) {
    return <div className="loading">📖 Loading Bible verses... (This may take a few seconds)</div>
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="header">
        <div className="header-top">
          <h1>📖 Bible Verse App</h1>
          <button onClick={toggleDarkMode} className="dark-toggle">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        <p className="subtitle">Your daily source of inspiration</p>
      </header>

      {/* Notification */}
      {copyMessage && <div className="notification">{copyMessage}</div>}
      {error && <div className={`notification ${error.includes('✅') || error.includes('Added') ? 'success' : 'error'}`}>{error}</div>}

      {/* Verse of the Day */}
      {verseOfTheDay && (
        <div className="verse-of-day">
          <h3>✨ Verse of the Day</h3>
          <div className="verse-card highlight">
            <p className="verse-text">"{verseOfTheDay.text}"</p>
            <p className="verse-reference">
              — {verseOfTheDay.book} {verseOfTheDay.chapter}:{verseOfTheDay.verse}
            </p>
            <div className="verse-actions">
              <button onClick={() => copyToClipboard(verseOfTheDay)} className="action-btn">
                <FaCopy /> Copy
              </button>
              <button onClick={() => shareVerse(verseOfTheDay)} className="action-btn">
                <FaShare /> Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Random Verse Section */}
      <div className="random-section">
        <button onClick={getRandomVerse} className="random-btn">
          <FaRandom /> Get Random Verse
        </button>
        {randomVerse && (
          <div className="verse-card random-card">
            <p className="verse-text">"{randomVerse.text}"</p>
            <p className="verse-reference">
              — {randomVerse.book} {randomVerse.chapter}:{randomVerse.verse}
            </p>
            <div className="verse-actions">
              <button onClick={() => copyToClipboard(randomVerse)} className="action-btn">
                <FaCopy /> Copy
              </button>
              <button onClick={() => shareVerse(randomVerse)} className="action-btn">
                <FaShare /> Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search verses (libu-libo na ang laman!)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="add-btn"
        >
          <FaPlus /> {showAddForm ? 'Close' : 'Add Verse'}
        </button>
      </div>

      {/* 📖 LOAD ENTIRE BOOK FROM API */}
      <div className="api-section">
        <h3>📥 Load Entire Book (Libu-libong Verses!)</h3>
        <div className="api-controls">
          <select 
            value={selectedBook} 
            onChange={(e) => setSelectedBook(e.target.value)}
            className="book-select"
          >
            <option value="">Pumili ng libro...</option>
            {bibleBooks.map((book, index) => (
              <option key={index} value={book}>{book}</option>
            ))}
          </select>
          <button 
            onClick={() => {
              if (selectedBook) {
                fetchBibleVerses(selectedBook)
              } else {
                setError('Please select a book first')
                setTimeout(() => setError(''), 3000)
              }
            }}
            className="api-btn"
            disabled={loading}
          >
            {loading ? '⏳ Loading...' : '📥 Load Entire Book'}
          </button>
        </div>
        <p className="api-info">
          💡 Pumili ng libro (hal. John, Psalms, Genesis) para ma-import ang <strong>LAHAT NG VERSES</strong> ng librong iyon.
          <br /> 📊 Halimbawa: Ang Book of John ay may <strong>879 verses</strong>, ang Psalms ay may <strong>2,461 verses</strong>!
        </p>
      </div>

      {/* Add Verse Form */}
      {showAddForm && (
        <form onSubmit={addVerse} className="add-form">
          <h3>Add New Verse</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Book (e.g., John)"
              value={newVerse.book}
              onChange={(e) => setNewVerse({...newVerse, book: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Chapter"
              value={newVerse.chapter}
              onChange={(e) => setNewVerse({...newVerse, chapter: e.target.value})}
            />
            <input
              type="number"
              placeholder="Verse"
              value={newVerse.verse}
              onChange={(e) => setNewVerse({...newVerse, verse: e.target.value})}
            />
          </div>
          <textarea
            placeholder="Verse text..."
            value={newVerse.text}
            onChange={(e) => setNewVerse({...newVerse, text: e.target.value})}
            rows="3"
            required
          />
          <button type="submit" className="submit-btn">Save Verse</button>
        </form>
      )}

      {/* All Verses List */}
      <div className="verses-list">
        <h2>📚 All Verses ({filteredVerses.length})</h2>
        {filteredVerses.length === 0 ? (
          <p className="no-verses">No verses found. Try loading a book or adding one!</p>
        ) : (
          <div className="verse-container">
            {filteredVerses.map((verse) => (
              <div key={verse.id} className="verse-card">
                <button 
                  onClick={() => deleteVerse(verse.id)} 
                  className="delete-btn"
                  title="Delete verse"
                >
                  <FaTrash />
                </button>
                <p className="verse-text">"{verse.text}"</p>
                <p className="verse-reference">
                  — {verse.book} {verse.chapter}:{verse.verse}
                </p>
                <div className="verse-actions">
                  <button onClick={() => copyToClipboard(verse)} className="action-btn">
                    <FaCopy /> Copy
                  </button>
                  <button onClick={() => shareVerse(verse)} className="action-btn">
                    <FaShare /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Bible Verse App | Made with ❤️</p>
        <p className="verse-count">Total Verses: {verses.length}</p>
      </footer>
    </div>
  )
}

export default App