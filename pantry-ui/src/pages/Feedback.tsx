import { useState } from 'react'
import { FaTrash } from 'react-icons/fa'

type Comment = { by: string; text: string }
type Post = { id: string; type: 'post'; title: string; body: string; likes: number; hearts: number; downs: number; neutrals: number; comments: Comment[] }
type PollOption = { label: string; votes: number }
type Poll = { id: string; type: 'poll'; question: string; options: PollOption[]; comments: Comment[] }
type Item = Post | Poll

export default function Feedback() {
  const [items, setItems] = useState<Item[]>([
    {
      id: 'p1',
      type: 'post',
      title: 'What new snacks should we add next month?',
      body: 'Share your ideas! We will order the top suggestions for June.',
      likes: 12,
      hearts: 5,
      downs: 1,
      neutrals: 2,
      comments: [
        { by: 'Ashley', text: 'Kinder Bueno pls!' },
        { by: 'Ravi', text: 'Spicy seaweed chips' },
      ],
    },
    {
      id: 'pl1',
      type: 'poll',
      question: 'Pick one coffee pod brand for the pantry',
      options: [
        { label: 'Nespresso', votes: 24 },
        { label: 'Starbucks', votes: 18 },
        { label: 'Local roaster', votes: 12 },
      ],
      comments: [
        { by: 'Mei', text: 'Local roaster tastes best!' },
      ],
    },
  ])

  const [newPost, setNewPost] = useState({ title: '', body: '' })
  const [newPoll, setNewPoll] = useState<{ question: string; options: string[] }>({ question: '', options: ['',''] })
  const [mode, setMode] = useState<'post' | 'poll'>('post')
  const isAdmin = (localStorage.getItem('role') || 'admin') === 'admin'
  const deleteItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const addPost = () => {
    if (!newPost.title || !newPost.body) return
    setItems(prev => [{ id: crypto.randomUUID(), type: 'post', title: newPost.title, body: newPost.body, likes: 0, hearts: 0, downs: 0, neutrals: 0, comments: [] }, ...prev])
    setNewPost({ title: '', body: '' })
  }

  const addPoll = () => {
    const opts = newPoll.options.map(o => o.trim()).filter(Boolean)
    if (!newPoll.question || opts.length < 2) return
    setItems(prev => [{ id: crypto.randomUUID(), type: 'poll', question: newPoll.question, options: opts.map(o => ({ label: o, votes: 0 })), comments: [] }, ...prev])
    setNewPoll({ question: '', options: ['',''] })
  }

  return (
    <>
      <h1 className="title" style={{ marginBottom: 12 }}>Feedback & Polls</h1>

      {isAdmin && (
        <div className="card">
          <div className="seg" style={{ marginBottom: 12 }}>
            <button onClick={() => setMode('post')} className={mode==='post' ? 'active' : ''}>Post</button>
            <button onClick={() => setMode('poll')} className={mode==='poll' ? 'active' : ''}>Poll</button>
          </div>
          {mode === 'post' ? (
            <div>
              <input placeholder="Title" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} style={{ width:'100%', border:'1px solid #d8d8d8', borderRadius:8, padding:'10px 12px', marginBottom: 8, fontFamily:'inherit' }} />
              <textarea placeholder="Write your feedback" value={newPost.body} onChange={e => setNewPost({ ...newPost, body: e.target.value })} style={{ width:'100%', border:'1px solid #d8d8d8', borderRadius:8, padding:'10px 12px', height: 90, marginBottom: 8, fontFamily:'inherit' }} />
              <button onClick={addPost} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'10px 14px', color:'#6b6b6b' }}>Post</button>
            </div>
          ) : (
            <div>
              <input placeholder="Question" value={newPoll.question} onChange={e => setNewPoll({ ...newPoll, question: e.target.value })} style={{ width:'100%', border:'1px solid #d8d8d8', borderRadius:8, padding:'10px 12px', marginBottom: 8 }} />
              {newPoll.options.map((opt, i) => (
                <div key={i} style={{ display:'flex', gap:8, alignItems:'center', marginBottom: 8 }}>
                  <input placeholder={`Option ${i+1}`} value={opt} onChange={e => setNewPoll({ ...newPoll, options: newPoll.options.map((o, j) => j===i ? e.target.value : o) })} style={{ flex:1, border:'1px solid #d8d8d8', borderRadius:8, padding:'10px 12px' }} />
                  <button onClick={() => setNewPoll(p => ({ ...p, options: p.options.filter((_, j) => j!==i) }))} style={{ border:'1px solid #e1e1e1', background:'#fff', color:'#6b6b6b', borderRadius:8, padding:'8px 10px' }}>×</button>
                </div>
              ))}
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setNewPoll(p => ({ ...p, options: [...p.options, ''] }))} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'10px 14px', color:'#6b6b6b' }}>Add option</button>
                <button onClick={addPoll} style={{ border:'1px solid #e1e1e1', background:'#f2f2f2', borderRadius:8, padding:'10px 14px', color:'#5b5b5b' }}>Create poll</button>
              </div>
            </div>
          )}
        </div>
      )}

      {items.map(item => (
        <div key={item.id} className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div />
            {isAdmin && (
              <button
                onClick={() => deleteItem(item.id)}
                title="Delete"
                style={{ border:'none', background:'transparent', color:'#8a8a8a', padding:'4px 6px' }}
              >
                <FaTrash />
              </button>
            )}
          </div>
          {item.type === 'post' ? (
            <>
              <h3>{item.title}</h3>
              <p style={{ marginTop: 8, color:'#666' }}>{item.body}</p>
              <div className="reactions">
                <button onClick={() => setItems(prev => prev.map(x => x === item ? { ...(x as Post), likes: (x as Post).likes + 1 } as Item : x))}>👍 {(item as Post).likes}</button>
                <button onClick={() => setItems(prev => prev.map(x => x === item ? { ...(x as Post), hearts: (x as Post).hearts + 1 } as Item : x))}>❤️ {(item as Post).hearts}</button>
                <button onClick={() => setItems(prev => prev.map(x => x === item ? { ...(x as Post), downs: (x as Post).downs + 1 } as Item : x))}>👎 {(item as Post).downs}</button>
                <button onClick={() => setItems(prev => prev.map(x => x === item ? { ...(x as Post), neutrals: (x as Post).neutrals + 1 } as Item : x))}>😐 {(item as Post).neutrals}</button>
              </div>
              <Comments item={item} setItems={setItems} />
            </>
          ) : (
            <>
              <h3>{(item as Poll).question}</h3>
              {(item as Poll).options.map((opt, i) => {
                const total = (item as Poll).options.reduce((s, o) => s + o.votes, 0) || 1
                const pct = Math.round((opt.votes / total) * 100)
                return (
                  <div key={i} className="poll-row">
                    <div>{opt.label}</div>
                    <div className="poll-bar"><div className="poll-fill" style={{ width: `${pct}%` }} /></div>
                    <div>{pct}%</div>
                  </div>
                )
              })}
              <div className="reactions">
              <PollVotes item={item as Poll} setItems={setItems} />
              </div>
              <Comments item={item} setItems={setItems} />
            </>
          )}
        </div>
      ))}
    </>
  )
}

function PollVotes({ item, setItems }: { item: Poll; setItems: React.Dispatch<React.SetStateAction<Item[]>> }) {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <div className="vote-group">
      {item.options.map((opt, i) => (
        <button
          key={i}
          className={`vote-btn ${selected === i ? 'selected' : ''}`}
          onClick={() => {
            setSelected(i)
            setItems(prev => prev.map(x => x === item ? { ...x, options: item.options.map((o, j) => j===i ? { ...o, votes: o.votes + 1 } : o) } as Item : x))
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Comments({ item, setItems }: { item: Item; setItems: React.Dispatch<React.SetStateAction<Item[]>> }) {
  const [text, setText] = useState('')
  const submit = () => {
    if (!text) return
    setItems(prev => prev.map(x => {
      if (x !== item) return x
      if (x.type === 'post') return { ...x, comments: [...x.comments, { by: 'Employee', text }] }
      return { ...x, comments: [...x.comments, { by: 'Employee', text }] }
    }))
    setText('')
  }
  const comments = item.type === 'post' ? item.comments : item.comments
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ color:'#6b6b6b', marginBottom: 8 }}>Comments</div>
      {comments.map((c, idx) => (
        <div key={idx} style={{ padding:'8px 0', borderTop: idx ? '1px solid #eee' : 'none', color:'#666' }}>
          <strong style={{ color:'#555' }}>{c.by}:</strong> {c.text}
        </div>
      ))}
      <div style={{ display:'flex', gap:8, marginTop: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment" style={{ flex:1, border:'1px solid #d8d8d8', borderRadius:8, padding:'10px 12px' }} />
        <button onClick={submit} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'10px 14px', color:'#6b6b6b' }}>Send</button>
      </div>
    </div>
  )
}



