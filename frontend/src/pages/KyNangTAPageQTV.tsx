import styles from "./kyNangTAPageQTV.module.css"
import { useState, useEffect, useRef } from "react"


const API = 'http://localhost:5000'


type ApprovalStatus = 'Hoạt động' | 'Ẩn' | 'Chờ duyệt'
const SKILL_CATS = ['Reading', 'Listening', 'Speaking', 'Writing', 'Grammar', 'Vocabulary']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'TOEIC', 'IELTS']
const CEFR_LEVELS = ['A2', 'B1', 'B2', 'C1'] as const
type CefrLevel = typeof CEFR_LEVELS[number]


interface BaiHocMo {
  MaBaiHocMo: number; TieuDe: string; MoTa: string; KyNang: string; CapDo: string
  LoaiBaiHoc: string; NoiDung: string; FileUrl: string; LinkUrl: string
  TrangThai: ApprovalStatus; TenNguoiTao: string; NgayTao: string
}


const statusColor: Record<ApprovalStatus, { bg: string; color: string }> = {
  'Hoạt động': { bg: '#dcfce7', color: '#16a34a' },
  'Ẩn':        { bg: '#f3f4f6', color: '#6b7280' },
  'Chờ duyệt': { bg: '#fef3c7', color: '#d97706' },
}


const cefrColor: Record<CefrLevel, { bg: string; color: string; border: string }> = {
  A2: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  B1: { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  B2: { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  C1: { bg: '#fce7f3', color: '#be185d', border: '#f9a8d4' },
}


const cefrDesc: Record<CefrLevel, string> = {
  A2: 'Sơ cấp – câu đơn giản, từ vựng cơ bản',
  B1: 'Trung cấp – câu phức, ý tưởng rõ ràng',
  B2: 'Trên trung cấp – lập luận mạch lạc',
  C1: 'Nâng cao – ngôn ngữ phong phú, súc tích',
}


type WritingSamples = Record<CefrLevel, string>


interface VocabRow       { word: string; meaning: string; example: string }
interface ReadingQRow    { text: string; answer: string }
interface QuestionRow    { text: string; options: string; answer: string }
interface UploadedFile   { name: string; size: string; type: string }
interface SpeakingPhrase { text: string; phonetic: string; translation: string }
interface GrammarExRow   { question: string; answer: string }


interface FormExtra {
  passage: string; vocab: VocabRow[]; readingQuestions: ReadingQRow[]
  objectives: string[]; listenQuestions: QuestionRow[]
  speakingTopics: string; speakingLevel: string; speakingPhrases: SpeakingPhrase[]; speakingTips: string
  writingPrompt: string; writingSentences: string[]; writingSamples: WritingSamples
  grammarSubtitle: string; grammarExplanation: string; grammarExRows: GrammarExRow[]
  vocabTheme: string
  vocabList: VocabRow[]
  uploadedFiles: UploadedFile[]; linkUrl: string
}


const emptyPhrase         = (): SpeakingPhrase => ({ text: '', phonetic: '', translation: '' })
const emptyWritingSamples = (): WritingSamples  => ({ A2: '', B1: '', B2: '', C1: '' })
const emptyGrammarEx      = (): GrammarExRow   => ({ question: '', answer: '' })
const emptyVocabRow       = (): VocabRow       => ({ word: '', meaning: '', example: '' })


const emptyExtra = (): FormExtra => ({
  passage: '', vocab: [{ word: '', meaning: '', example: '' }], readingQuestions: [{ text: '', answer: '' }],
  objectives: [''], listenQuestions: [{ text: '', options: '', answer: '' }],
  speakingTopics: '', speakingLevel: 'Easy', speakingPhrases: [emptyPhrase()], speakingTips: '',
  writingPrompt: '', writingSentences: ['', '', '', ''], writingSamples: emptyWritingSamples(),
  grammarSubtitle: '', grammarExplanation: '', grammarExRows: [emptyGrammarEx()],
  vocabTheme: '', vocabList: [emptyVocabRow()],
  uploadedFiles: [], linkUrl: '',
})


const parseNoiDungToExtra = (noiDung: string, kyNang: string, linkUrl: string): FormExtra => {
  const base = emptyExtra()
  base.linkUrl = linkUrl || ''
  try {
    const p = JSON.parse(noiDung || '{}')
    if (kyNang === 'Reading') {
      base.passage = p.passage || ''
      base.vocab = Array.isArray(p.vocab) && p.vocab.length
        ? p.vocab.map((v: any) => ({ word: v.word || '', meaning: v.meaning || '', example: v.example || '' }))
        : [emptyVocabRow()]
      base.readingQuestions = Array.isArray(p.questions) && p.questions.length
        ? p.questions.map((q: any) => typeof q === 'string' ? { text: q, answer: '' } : { text: q.text || '', answer: q.answer || '' })
        : [{ text: '', answer: '' }]
    } else if (kyNang === 'Listening') {
      base.objectives = Array.isArray(p.objectives) && p.objectives.length ? p.objectives : ['']
      base.listenQuestions = Array.isArray(p.questions) && p.questions.length
        ? p.questions.map((q: any) => typeof q === 'string' ? { text: q, options: '', answer: '' } : { text: q.text || '', options: q.options || '', answer: q.answer || '' })
        : [{ text: '', options: '', answer: '' }]
    } else if (kyNang === 'Speaking') {
      base.speakingTopics  = p.topics || ''
      base.speakingLevel   = p.level  || 'Easy'
      base.speakingPhrases = Array.isArray(p.phrases) && p.phrases.length ? p.phrases : [emptyPhrase()]
      base.speakingTips    = p.tips   || ''
    } else if (kyNang === 'Writing') {
      base.writingPrompt    = p.prompt || ''
      base.writingSentences = Array.isArray(p.sentences) && p.sentences.length ? p.sentences : ['', '', '', '']
      base.writingSamples   = { A2: p.samples?.A2 || '', B1: p.samples?.B1 || '', B2: p.samples?.B2 || '', C1: p.samples?.C1 || '' }
    } else if (kyNang === 'Grammar') {
      base.grammarSubtitle    = p.subtitle    || ''
      base.grammarExplanation = p.explanation || ''
      if (p.exercises) {
        const rows: GrammarExRow[] = []
        p.exercises.split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
          const match = line.match(/^\d+\.\s(.+?)\s*→\s*(.+)$/)
          if (match) rows.push({ question: match[1].trim(), answer: match[2].trim() })
          else { const s = line.replace(/^\d+\.\s*/, '').trim(); if (s) rows.push({ question: s, answer: '' }) }
        })
        base.grammarExRows = rows.length ? rows : [emptyGrammarEx()]
      }
    } else if (kyNang === 'Vocabulary') {
      base.vocabTheme = p.theme || ''
      base.vocabList = Array.isArray(p.vocabList) && p.vocabList.length
        ? p.vocabList.map((v: any) => ({ word: v.word || '', meaning: v.meaning || '', example: v.example || '' }))
        : [emptyVocabRow()]
    }
  } catch { /* keep defaults */ }
  return base
}


const buildContentFromExtra = (cat: string, ex: FormExtra): string => {
  if (cat === 'Reading')   return JSON.stringify({ passage: ex.passage, vocab: ex.vocab, questions: ex.readingQuestions })
  if (cat === 'Listening') return JSON.stringify({ objectives: ex.objectives, questions: ex.listenQuestions })
  if (cat === 'Speaking')  return JSON.stringify({ topics: ex.speakingTopics, level: ex.speakingLevel, phrases: ex.speakingPhrases, tips: ex.speakingTips })
  if (cat === 'Writing')   return JSON.stringify({ prompt: ex.writingPrompt, sentences: ex.writingSentences.filter(s => s.trim()), samples: ex.writingSamples })
  if (cat === 'Grammar') {
    const exercisesStr = ex.grammarExRows.filter(r => r.question.trim() && r.answer.trim()).map((r, i) => `${i + 1}. ${r.question.trim()} → ${r.answer.trim()}`).join('\n')
    return JSON.stringify({ subtitle: ex.grammarSubtitle, explanation: ex.grammarExplanation, exercises: exercisesStr })
  }
  if (cat === 'Vocabulary') return JSON.stringify({ theme: ex.vocabTheme, vocabList: ex.vocabList.filter(v => v.word.trim() && v.meaning.trim()) })
  return '{}'
}


const sec: React.CSSProperties  = { fontSize: 13, fontWeight: 700, color: '#F95800', margin: '18px 0 8px', paddingBottom: 6, borderBottom: '1.5px solid #fde8d4' }
const inp: React.CSSProperties  = { width: '100%', padding: '8px 11px', border: '1.5px solid #e0d8cc', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
const rowStyle: React.CSSProperties  = { display: 'grid', gridTemplateColumns: '1fr 1fr 32px', gap: 8, marginBottom: 8, alignItems: 'center' }
const row1Style: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 32px', gap: 8, marginBottom: 8, alignItems: 'center' }
const addRowBtn: React.CSSProperties = { background: 'none', border: '1.5px dashed #F95800', color: '#F95800', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', marginBottom: 4 }
const rmBtn: React.CSSProperties    = { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 14, padding: '3px 6px', borderRadius: 5 }
const qBlock: React.CSSProperties   = { background: '#fdf8f3', border: '1px solid #f0e4d4', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }


const KyNangPage = () => {
  const [lessons, setLessons]         = useState<BaiHocMo[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState("")
  const [skillFilter, setSkillFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | ApprovalStatus>("Tất cả")
  const [showAddModal, setShowAddModal]   = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<BaiHocMo | null>(null)

  const [activeCefr, setActiveCefr]         = useState<CefrLevel>('B1')
  const [newLesson, setNewLesson]           = useState({ title: "", category: "Reading", level: "Beginner", desc: "" })
  const [extra, setExtra]                   = useState<FormExtra>(emptyExtra())
  const [uploading, setUploading]           = useState(false)
  const [uploadedFileObjects, setUploadedFileObjects] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [editActiveCefr, setEditActiveCefr] = useState<CefrLevel>('B1')
  const [editLesson, setEditLesson]         = useState({ title: "", category: "Reading", level: "Beginner", desc: "", status: "Chờ duyệt" as ApprovalStatus })
  const [editExtra, setEditExtra]           = useState<FormExtra>(emptyExtra())
  const [editUploading, setEditUploading]   = useState(false)
  const [editUploadedFileObjects, setEditUploadedFileObjects] = useState<File[]>([])
  const editFileInputRef = useRef<HTMLInputElement | null>(null)

  const [toast, setToast]       = useState("")
  const [toastType, setToastType] = useState<"success" | "warn">("success")

  // ── DELETE MODAL STATE ──────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteMessage, setDeleteMessage]     = useState('')
  const [deleteAction, setDeleteAction]       = useState<(() => Promise<void>) | null>(null)

  const confirmAction = (msg: string, action: () => Promise<void>) => {
    setDeleteMessage(msg)
    setDeleteAction(() => action)
    setShowDeleteModal(true)
  }

  const showToast = (msg: string, type: "success" | "warn" = "success") => {
    setToast(msg); setToastType(type); setTimeout(() => setToast(""), 2500)
  }

  const loadLessons = () => {
    setLoading(true)
    fetch(`${API}/baihocmo`).then(r => r.json())
      .then(data => setLessons(Array.isArray(data) ? data : []))
      .catch(() => showToast('Lỗi tải dữ liệu', 'warn'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadLessons() }, [])

  const filtered = lessons.filter(item => {
    const ms  = item.TieuDe?.toLowerCase().includes(search.toLowerCase()) || item.TenNguoiTao?.toLowerCase().includes(search.toLowerCase())
    const mk  = skillFilter === "Tất cả" || item.KyNang === skillFilter
    const mst = statusFilter === "Tất cả" || item.TrangThai === statusFilter
    return ms && mk && mst
  })

  const totalLesson   = lessons.length
  const activeLesson  = lessons.filter(i => i.TrangThai === "Hoạt động").length
  const pendingLesson = lessons.filter(i => i.TrangThai === "Chờ duyệt").length
  const teacherCount  = new Set(lessons.map(i => i.TenNguoiTao).filter(Boolean)).size

  const uploadFileToServer = async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch(`${API}/upload`, { method: 'POST', body: fd })
    return (await res.json()).url || ''
  }

  const handleAdd = async () => {
    if (!newLesson.title.trim()) { alert("Vui lòng nhập tiêu đề!"); return }
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    try {
      setUploading(true)
      let fileUrl = ''
      if (uploadedFileObjects.length > 0) { showToast('Đang upload...', 'success'); fileUrl = await uploadFileToServer(uploadedFileObjects[0]) }
      await fetch(`${API}/baihocmo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TieuDe: newLesson.title, MoTa: newLesson.desc, KyNang: newLesson.category, CapDo: newLesson.level, LoaiBaiHoc: newLesson.category, NoiDung: buildContentFromExtra(newLesson.category, extra), LinkUrl: extra.linkUrl, FileUrl: fileUrl, MaNguoiDung: user.MaNguoiDung || 6 })
      })
      showToast("Đã thêm bài học – đang chờ duyệt")
      setShowAddModal(false); setNewLesson({ title: "", category: "Reading", level: "Beginner", desc: "" })
      setExtra(emptyExtra()); setUploadedFileObjects([]); setActiveCefr('B1'); loadLessons()
    } catch { showToast('Lỗi khi thêm bài', 'warn') }
    finally { setUploading(false) }
  }

  const openEdit = (item: BaiHocMo) => {
    setSelectedLesson(item)
    setEditLesson({ title: item.TieuDe, category: item.KyNang, level: item.CapDo, desc: item.MoTa || '', status: item.TrangThai })
    setEditExtra(parseNoiDungToExtra(item.NoiDung, item.KyNang, item.LinkUrl))
    setEditActiveCefr('B1'); setEditUploadedFileObjects([]); setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedLesson) return
    try {
      setEditUploading(true)
      let fileUrl = selectedLesson.FileUrl || ''
      if (editUploadedFileObjects.length > 0) { showToast('Đang upload...', 'success'); fileUrl = await uploadFileToServer(editUploadedFileObjects[0]) }
      await fetch(`${API}/baihocmo/${selectedLesson.MaBaiHocMo}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TieuDe: editLesson.title, MoTa: editLesson.desc, KyNang: editLesson.category, CapDo: editLesson.level, LoaiBaiHoc: editLesson.category, NoiDung: buildContentFromExtra(editLesson.category, editExtra), LinkUrl: editExtra.linkUrl, FileUrl: fileUrl, TrangThai: editLesson.status })
      })
      showToast("Đã lưu thay đổi!"); setShowEditModal(false); loadLessons()
    } catch { showToast('Lỗi khi lưu', 'warn') }
    finally { setEditUploading(false) }
  }

  // ── Dùng confirmAction thay confirm() ──────────────────────────────────
  const handleDelete = (id: number, title: string) => {
    confirmAction(`Bạn có chắc chắn muốn xóa bài học "${title}" không?`, async () => {
      await fetch(`${API}/baihocmo/${id}`, { method: 'DELETE' })
      showToast("Đã xóa!", "warn")
      loadLessons()
    })
  }

  const handleToggleStatus = async (item: BaiHocMo) => {
    const next: ApprovalStatus = item.TrangThai === 'Hoạt động' ? 'Ẩn' : 'Hoạt động'
    try {
      await fetch(`${API}/baihocmo/${item.MaBaiHocMo}/duyet`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ TrangThai: next }) })
      showToast(`Đã ${next === 'Hoạt động' ? 'bật' : 'ẩn'} bài học!`); loadLessons()
    } catch { showToast('Lỗi', 'warn') }
  }

  const formatSize = (b: number) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = e.target.files; if (!files) return
    const fa = Array.from(files)
    if (isEdit) { setEditUploadedFileObjects(p => [...p, ...fa]); setEditExtra(ex => ({ ...ex, uploadedFiles: [...ex.uploadedFiles, ...fa.map(f => ({ name: f.name, size: formatSize(f.size), type: f.type }))] })) }
    else        { setUploadedFileObjects(p => [...p, ...fa]);     setExtra(ex => ({ ...ex, uploadedFiles: [...ex.uploadedFiles, ...fa.map(f => ({ name: f.name, size: formatSize(f.size), type: f.type }))] })) }
    e.target.value = ''
  }

  const fileIcon = (t: string) => t.includes('pdf') ? '📄' : t.includes('audio') ? '🎵' : t.includes('video') ? '🎬' : t.includes('image') ? '🖼️' : '📎'
  const uploadAccept: Record<string, string> = { Reading: '.pdf,.doc,.docx', Listening: '.mp3,.wav,.ogg,.m4a', Speaking: '.mp3,.wav,.ogg,.mp4,.mov', Writing: '.pdf,.doc,.docx', Grammar: '.pdf,.doc,.docx,.ppt,.pptx', Vocabulary: '.pdf,.doc,.docx,.jpg,.png' }
  const uploadLabel:  Record<string, string> = { Reading: 'PDF / Word', Listening: 'File âm thanh', Speaking: 'File âm thanh / video', Writing: 'PDF / Word', Grammar: 'PDF / PPT', Vocabulary: 'PDF / Word / Hình ảnh' }

  const updVocab     = (i: number, f: keyof VocabRow, v: string)       => setExtra(e => { const a = [...e.vocab]; a[i] = { ...a[i], [f]: v }; return { ...e, vocab: a } })
  const updVocabList = (i: number, f: keyof VocabRow, v: string)       => setExtra(e => { const a = [...e.vocabList]; a[i] = { ...a[i], [f]: v }; return { ...e, vocabList: a } })
  const updLQ        = (i: number, f: keyof QuestionRow, v: string)    => setExtra(e => { const a = [...e.listenQuestions]; a[i] = { ...a[i], [f]: v }; return { ...e, listenQuestions: a } })
  const updRQ        = (i: number, f: keyof ReadingQRow, v: string)    => setExtra(e => { const a = [...e.readingQuestions]; a[i] = { ...a[i], [f]: v }; return { ...e, readingQuestions: a } })
  const updObj       = (i: number, v: string) => setExtra(e => { const a = [...e.objectives]; a[i] = v; return { ...e, objectives: a } })
  const updPhrase    = (i: number, f: keyof SpeakingPhrase, v: string) => setExtra(e => { const a = [...e.speakingPhrases]; a[i] = { ...a[i], [f]: v }; return { ...e, speakingPhrases: a } })
  const updGrEx      = (i: number, f: keyof GrammarExRow, v: string)   => setExtra(e => { const a = [...e.grammarExRows]; a[i] = { ...a[i], [f]: v }; return { ...e, grammarExRows: a } })

  const eUpdVocab     = (i: number, f: keyof VocabRow, v: string)       => setEditExtra(e => { const a = [...e.vocab]; a[i] = { ...a[i], [f]: v }; return { ...e, vocab: a } })
  const eUpdVocabList = (i: number, f: keyof VocabRow, v: string)       => setEditExtra(e => { const a = [...e.vocabList]; a[i] = { ...a[i], [f]: v }; return { ...e, vocabList: a } })
  const eUpdLQ        = (i: number, f: keyof QuestionRow, v: string)    => setEditExtra(e => { const a = [...e.listenQuestions]; a[i] = { ...a[i], [f]: v }; return { ...e, listenQuestions: a } })
  const eUpdRQ        = (i: number, f: keyof ReadingQRow, v: string)    => setEditExtra(e => { const a = [...e.readingQuestions]; a[i] = { ...a[i], [f]: v }; return { ...e, readingQuestions: a } })
  const eUpdObj       = (i: number, v: string) => setEditExtra(e => { const a = [...e.objectives]; a[i] = v; return { ...e, objectives: a } })
  const eUpdPhrase    = (i: number, f: keyof SpeakingPhrase, v: string) => setEditExtra(e => { const a = [...e.speakingPhrases]; a[i] = { ...a[i], [f]: v }; return { ...e, speakingPhrases: a } })
  const eUpdGrEx      = (i: number, f: keyof GrammarExRow, v: string)   => setEditExtra(e => { const a = [...e.grammarExRows]; a[i] = { ...a[i], [f]: v }; return { ...e, grammarExRows: a } })

  const renderUploadSection = (isEdit = false) => {
    const cat = isEdit ? editLesson.category : newLesson.category
    const exData  = isEdit ? editExtra : extra
    const accept  = uploadAccept[cat] || '*'
    const label   = uploadLabel[cat]  || 'Tài liệu'
    const fRef    = isEdit ? editFileInputRef : fileInputRef
    const setEx   = isEdit ? setEditExtra : setExtra
    const setObjs = isEdit ? setEditUploadedFileObjects : setUploadedFileObjects
    return (
      <div>
        <div style={sec}>📁 Tải file lên</div>
        {isEdit && selectedLesson?.FileUrl && (
          <div style={{ marginBottom: 10, padding: '8px 12px', background: '#f4f9ff', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📄</span><span style={{ color: '#1565c0' }}>File hiện tại: {selectedLesson.FileUrl.split('/').pop()}</span>
            <a href={`${API}${selectedLesson.FileUrl}`} target="_blank" rel="noreferrer" style={{ color: '#F95800', marginLeft: 'auto' }}>Xem</a>
          </div>
        )}
        <p style={{ fontSize: 12.5, color: '#999', margin: '0 0 10px' }}>Định dạng: <strong>{accept}</strong></p>
        {exData.uploadedFiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {exData.uploadedFiles.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f4f9ff', border: '1px solid #c8dff8', borderRadius: 9, padding: '9px 14px' }}>
                <span style={{ fontSize: 20 }}>{fileIcon(f.type)}</span>
                <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{f.name}</p><p style={{ margin: 0, fontSize: 11.5, color: '#999' }}>{f.size}</p></div>
                <button onClick={() => { setEx(ex => ({ ...ex, uploadedFiles: ex.uploadedFiles.filter((_, j) => j !== i) })); setObjs(p => p.filter((_, j) => j !== i)) }} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ border: '2px dashed #e0d8cc', borderRadius: 12, padding: '22px 20px', textAlign: 'center', background: '#fdf8f3', cursor: 'pointer', marginBottom: 12 }}
          onClick={() => fRef.current?.click()} onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const fa = Array.from(e.dataTransfer.files); setObjs(p => [...p, ...fa]); setEx(ex => ({ ...ex, uploadedFiles: [...ex.uploadedFiles, ...fa.map(f => ({ name: f.name, size: formatSize(f.size), type: f.type }))] })) }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>⬆️</div>
          <p style={{ margin: 0, fontSize: 14, color: '#555', fontWeight: 500 }}>Kéo thả file vào đây</p>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#aaa' }}>hoặc nhấn để chọn — {label}</p>
        </div>
        <input ref={fRef} type="file" multiple accept={accept} style={{ display: 'none' }} onChange={e => handleFileUpload(e, isEdit)} />
        <div className={styles.form}>
          <div className={styles.full}>
            <label>Hoặc nhập link (YouTube / Google Drive...)</label>
            <input style={inp} placeholder="https://..." value={exData.linkUrl} onChange={e => setEx(ex => ({ ...ex, linkUrl: e.target.value }))} />
          </div>
        </div>
      </div>
    )
  }

  const renderVocabularyFields = (isEdit = false) => {
    const ex       = isEdit ? editExtra    : extra
    const setEx    = isEdit ? setEditExtra : setExtra
    const uVocList = isEdit ? eUpdVocabList : updVocabList
    const filledCount = ex.vocabList.filter(v => v.word.trim() && v.meaning.trim()).length
    const isEnough    = filledCount >= 4
    const autoExample = (word: string, meaning: string) => word && meaning ? `The word "${word}" means "${meaning}" in Vietnamese.` : ''
    return (
      <>
        <div style={sec}>📚 Thông tin bài học từ vựng</div>
        <div className={styles.form}>
          <div className={styles.full}>
            <label>Chủ đề từ vựng</label>
            <input style={inp} placeholder="VD: Technology & Internet, Daily Life, Office..." value={ex.vocabTheme} onChange={e => setEx(ex2 => ({ ...ex2, vocabTheme: e.target.value }))} />
          </div>
        </div>
        <div style={sec}>📋 Danh sách từ vựng</div>
        <div style={{ background: '#fff8f0', border: '1.5px solid #fde8d4', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#F95800', fontSize: 13 }}>📌 Lưu ý</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#666', lineHeight: 1.9 }}>
            <li>Sinh viên sẽ thấy bảng từ vựng 2 cột: <strong>Từ vựng</strong> | <strong>Nghĩa tiếng Việt</strong></li>
            <li>Phần <strong>Ví dụ sử dụng</strong> hiển thị bên dưới bảng — có thể để trống (tự tạo từ từ + nghĩa)</li>
            <li>Bài luyện tập: quiz <em>"What is the meaning of...?"</em> — 4 đáp án A/B/C/D</li>
            <li>Cần tối thiểu <strong>4 từ</strong> để tạo đủ đáp án nhiễu cho sinh viên</li>
          </ul>
        </div>
        {!isEnough && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef3c7', border: '1.5px solid #fcd34d', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div><span style={{ fontWeight: 700, color: '#b45309', fontSize: 13 }}>Cần thêm từ vựng! </span><span style={{ fontSize: 12.5, color: '#92400e' }}>Đã điền: <strong>{filledCount}</strong>/4 từ tối thiểu.</span></div>
          </div>
        )}
        {isEnough && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ fontSize: 12.5, color: '#15803d' }}>
              <strong>{filledCount} từ</strong> — đủ để tạo bài luyện tập
              {filledCount > 8 && <span style={{ color: '#0369a1' }}> · Hệ thống chọn ngẫu nhiên 8 câu</span>}
            </span>
          </div>
        )}
        {filledCount > 0 && (
          <div style={{ marginBottom: 16, border: '1.5px solid #e0d8cc', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f5f0e8', padding: '10px 16px', fontSize: 12.5, fontWeight: 700, color: '#555', borderBottom: '1px solid #e0d8cc' }}>
              <span>Từ vựng</span><span>Nghĩa tiếng Việt</span>
            </div>
            {ex.vocabList.filter(v => v.word.trim() && v.meaning.trim()).map((v, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '9px 16px', fontSize: 13, borderBottom: i < filledCount - 1 ? '1px solid #f0e8de' : 'none', background: i % 2 === 0 ? '#fff' : '#fdf8f3' }}>
                <span style={{ fontWeight: 500 }}>{i + 1}. {v.word}</span>
                <span style={{ color: '#555' }}>{v.meaning}</span>
              </div>
            ))}
          </div>
        )}
        {ex.vocabList.map((v, i) => {
          const filled = v.word.trim() && v.meaning.trim()
          return (
            <div key={i} style={{ background: filled ? '#fdf8f3' : '#fafafa', border: `1.5px solid ${filled ? '#f0e4d4' : '#e5e7eb'}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: filled ? '#16a34a' : '#d1d5db', borderRadius: 5, padding: '3px 8px' }}>{filled ? `✓ ${i + 1}` : i + 1}</span>
                  {filled && <span style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600 }}>{v.word}</span>}
                </div>
                <button style={{ ...rmBtn, color: '#ef4444', fontSize: 12 }} onClick={() => setEx(e => ({ ...e, vocabList: e.vocabList.filter((_, j) => j !== i) }))}>✕ Xóa</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4 }}>Từ vựng (tiếng Anh)</label>
                  <input style={inp} placeholder="VD: artificial intelligence" value={v.word} onChange={e => uVocList(i, 'word', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4 }}>Nghĩa tiếng Việt</label>
                  <input style={inp} placeholder="VD: trí tuệ nhân tạo" value={v.meaning} onChange={e => uVocList(i, 'meaning', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', display: 'block', marginBottom: 4 }}>
                  💡 Ví dụ sử dụng
                  <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 6 }}>(tuỳ chọn — để trống sẽ tự tạo)</span>
                </label>
                <input style={{ ...inp, borderColor: v.example ? '#93c5fd' : '#e0d8cc', background: v.example ? '#eff6ff' : '#fff' }}
                  placeholder={filled ? autoExample(v.word, v.meaning) : 'VD: The word "..." means "..." in Vietnamese.'}
                  value={v.example} onChange={e => uVocList(i, 'example', e.target.value)} />
                {filled && !v.example && (
                  <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#9ca3af', fontStyle: 'italic' }}>→ Tự tạo: <em>{autoExample(v.word, v.meaning)}</em></p>
                )}
              </div>
            </div>
          )
        })}
        <button style={addRowBtn} onClick={() => setEx(e => ({ ...e, vocabList: [...e.vocabList, emptyVocabRow()] }))}>+ Thêm từ vựng</button>
        {renderUploadSection(isEdit)}
      </>
    )
  }

  const renderWritingFields = (isEdit = false) => {
    const ex = isEdit ? editExtra : extra; const setEx = isEdit ? setEditExtra : setExtra
    const cefr = isEdit ? editActiveCefr : activeCefr; const setCefr = isEdit ? setEditActiveCefr : setActiveCefr
    const updSent = (i: number, v: string) => setEx(e => { const a = [...e.writingSentences]; a[i] = v; return { ...e, writingSentences: a } })
    return (
      <>
        <div style={sec}>✍️ Đề bài (Writing Prompt)</div>
        <p style={{ fontSize: 12.5, color: '#888', margin: '0 0 8px' }}>Hiển thị trong mục <strong>"Bài tập"</strong> ở trang luyện tập sinh viên.</p>
        <div className={styles.form}><div className={styles.full}><label>Yêu cầu đề bài <span style={{ color: 'red' }}>*</span></label><input style={inp} placeholder="VD: Luyện viết thư xin việc chính thức bằng tiếng Anh" value={ex.writingPrompt} onChange={e => setEx(ex2 => ({ ...ex2, writingPrompt: e.target.value }))} /></div></div>
        <div style={sec}>🔀 Các câu luyện tập sắp xếp (Drag &amp; Drop)</div>
        <div style={{ background: '#fff8f0', border: '1.5px solid #fde8d4', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#F95800', fontSize: 13 }}>📌 Cách hoạt động</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#666', lineHeight: 1.9 }}>
            <li>Nhập từng câu theo <strong>đúng thứ tự</strong> tạo thành đoạn văn hoàn chỉnh</li>
            <li>Hệ thống sẽ <strong>tự xáo trộn</strong> thứ tự khi hiển thị cho sinh viên</li>
            <li>Sinh viên kéo thả sắp xếp lại → nộp bài → nhận điểm tự động</li>
            <li><span style={{ color: '#F95800', fontWeight: 700 }}>Thứ tự nhập = đáp án đúng</span></li>
          </ul>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 32px', gap: 8, marginBottom: 6, fontSize: 11.5, color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span style={{ textAlign: 'center' }}>STT</span><span>Nội dung câu (tiếng Anh)</span><span />
        </div>
        {ex.writingSentences.map((sent, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 32px', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: '#F95800', borderRadius: 6, textAlign: 'center', padding: '9px 0', lineHeight: 1 }}>{i + 1}</div>
            <textarea style={{ ...inp, height: 58, resize: 'vertical', lineHeight: 1.5 }} placeholder={`Câu ${i + 1}`} value={sent} onChange={e => updSent(i, e.target.value)} />
            <button style={{ ...rmBtn, marginTop: 6 }} onClick={() => setEx(e => ({ ...e, writingSentences: e.writingSentences.filter((_, j) => j !== i) }))}>✕</button>
          </div>
        ))}
        {ex.writingSentences.some(s => s.trim()) && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, padding: '10px 14px', marginBottom: 10, fontSize: 12.5 }}>
            <span style={{ fontWeight: 700, color: '#16a34a', display: 'block', marginBottom: 7 }}>👁 Preview đoạn văn đúng thứ tự:</span>
            {ex.writingSentences.filter(s => s.trim()).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', borderRadius: 4, padding: '2px 6px', minWidth: 20, textAlign: 'center', flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                <span style={{ color: '#374151', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <button style={addRowBtn} onClick={() => setEx(e => ({ ...e, writingSentences: [...e.writingSentences, ''] }))}>+ Thêm câu</button>
          {ex.writingSentences.length > 1 && <button style={{ ...addRowBtn, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => setEx(e => ({ ...e, writingSentences: e.writingSentences.slice(0, -1) }))}>− Bớt câu cuối</button>}
        </div>
        <div style={sec}>📝 Bài mẫu theo cấp độ CEFR</div>
        <p style={{ fontSize: 12.5, color: '#888', margin: '0 0 12px' }}>Sinh viên xem sau khi nộp bài. Nên điền ít nhất <strong>B1</strong>.</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {CEFR_LEVELS.map(lvl => {
            const c = cefrColor[lvl]; const isAct = cefr === lvl; const hasTxt = !!ex.writingSamples[lvl]
            return (<button key={lvl} onClick={() => setCefr(lvl)} style={{ padding: '7px 18px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, border: `2px solid ${isAct ? c.border : '#e0d8cc'}`, background: isAct ? c.bg : '#fff', color: isAct ? c.color : '#888', position: 'relative', transition: 'all .15s' }}>
              {lvl}{lvl === 'B1' && !hasTxt && <span style={{ position: 'absolute', top: -8, right: -4, fontSize: 10, color: '#d97706', fontWeight: 700 }}>★</span>}
              {hasTxt && <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: c.color, border: '1.5px solid #fff' }} />}
            </button>)
          })}
        </div>
        {CEFR_LEVELS.map(lvl => { const c = cefrColor[lvl]; return (
          <div key={lvl} style={{ display: cefr === lvl ? 'block' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{lvl}</span>
              <span style={{ fontSize: 12, color: '#888' }}>{cefrDesc[lvl]}</span>
              {lvl === 'B1' && <span style={{ fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Mặc định hiển thị</span>}
            </div>
            <textarea style={{ ...inp, height: 160, resize: 'vertical', lineHeight: 1.6 }} placeholder={`Nhập bài mẫu cấp ${lvl}...`} value={ex.writingSamples[lvl]} onChange={e => setEx(ex2 => ({ ...ex2, writingSamples: { ...ex2.writingSamples, [lvl]: e.target.value } }))} />
          </div>
        )})}
        {renderUploadSection(isEdit)}
      </>
    )
  }

  const renderGrammarFields = (isEdit = false) => {
    const ex = isEdit ? editExtra : extra; const setEx = isEdit ? setEditExtra : setExtra
    const uGrEx = isEdit ? eUpdGrEx : updGrEx
    const previewLines = ex.grammarExRows.filter(r => r.question.trim() && r.answer.trim()).map((r, i) => `${i + 1}. ${r.question} → ${r.answer}`)
    return (
      <>
        <div style={sec}>📐 Thông tin ngữ pháp</div>
        <div className={styles.form}>
          <div className={styles.full}><label>Tiêu đề phụ</label><input style={inp} placeholder="VD: Must vs Have to" value={ex.grammarSubtitle} onChange={e => setEx(ex2 => ({ ...ex2, grammarSubtitle: e.target.value }))} /></div>
          <div className={styles.full}><label>Lý thuyết &amp; Ví dụ</label><textarea style={{ ...inp, height: 100, resize: 'vertical' }} placeholder="Giải thích ngữ pháp, ví dụ minh hoạ..." value={ex.grammarExplanation} onChange={e => setEx(ex2 => ({ ...ex2, grammarExplanation: e.target.value }))} /></div>
        </div>
        <div style={sec}>✏️ Bài tập trắc nghiệm điền vào chỗ trống</div>
        <div style={{ background: '#fff8f0', border: '1.5px solid #fde8d4', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#F95800', fontSize: 13 }}>📌 Cách nhập</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#666', lineHeight: 1.9 }}>
            <li>Câu hỏi: dùng <code style={{ background: '#fde8d4', padding: '1px 5px', borderRadius: 4 }}>___</code> để đánh dấu chỗ trống</li>
            <li>Đáp án: nhập từ/cụm từ đúng điền vào chỗ trống</li>
            <li>VD: <em>She ___ (work) every day.</em> → <em>works</em></li>
          </ul>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 32px', gap: 8, marginBottom: 6, fontSize: 11.5, color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span style={{ textAlign: 'center' }}>STT</span><span>Câu hỏi (dùng ___ cho chỗ trống)</span><span>Đáp án đúng</span><span />
        </div>
        {ex.grammarExRows.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 32px', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: '#F95800', borderRadius: 6, textAlign: 'center', padding: '9px 0', lineHeight: 1 }}>{i + 1}</div>
            <input style={inp} placeholder="VD: She ___ (work) every day." value={row.question} onChange={e => uGrEx(i, 'question', e.target.value)} />
            <input style={{ ...inp, borderColor: '#86efac', background: '#f0fdf4' }} placeholder="VD: works" value={row.answer} onChange={e => uGrEx(i, 'answer', e.target.value)} />
            <button style={{ ...rmBtn, marginTop: 6 }} onClick={() => setEx(e => ({ ...e, grammarExRows: e.grammarExRows.filter((_, j) => j !== i) }))}>✕</button>
          </div>
        ))}
        {previewLines.length > 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, padding: '10px 14px', marginBottom: 10, fontSize: 12.5 }}>
            <span style={{ fontWeight: 700, color: '#16a34a', display: 'block', marginBottom: 7 }}>👁 Preview (format lưu DB):</span>
            {previewLines.map((l, i) => <div key={i} style={{ color: '#374151', lineHeight: 1.8, fontFamily: 'monospace' }}>{l}</div>)}
          </div>
        )}
        <button style={addRowBtn} onClick={() => setEx(e => ({ ...e, grammarExRows: [...e.grammarExRows, emptyGrammarEx()] }))}>+ Thêm câu hỏi</button>
        {renderUploadSection(isEdit)}
      </>
    )
  }

  const renderSkillFields = (isEdit = false) => {
    const cat   = isEdit ? editLesson.category : newLesson.category
    const ex    = isEdit ? editExtra : extra
    const setEx = isEdit ? setEditExtra : setExtra
    const uVocab  = isEdit ? eUpdVocab  : updVocab
    const uLQ     = isEdit ? eUpdLQ     : updLQ
    const uRQ     = isEdit ? eUpdRQ     : updRQ
    const uObj    = isEdit ? eUpdObj    : updObj
    const uPhrase = isEdit ? eUpdPhrase : updPhrase

    if (cat === 'Writing')    return renderWritingFields(isEdit)
    if (cat === 'Grammar')    return renderGrammarFields(isEdit)
    if (cat === 'Vocabulary') return renderVocabularyFields(isEdit)

    if (cat === 'Reading') return (
      <>
        <div style={sec}>📖 Bài đọc (Reading Passage)</div>
        <div className={styles.form}><div className={styles.full}><label>Đoạn văn</label><textarea style={{ ...inp, height: 110, resize: 'vertical' }} placeholder="Nhập đoạn văn tiếng Anh..." value={ex.passage} onChange={e => setEx(ex2 => ({ ...ex2, passage: e.target.value }))} /></div></div>
        <div style={sec}>📝 Từ vựng</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 32px', gap: 8, marginBottom: 6, fontSize: 12, color: '#999', fontWeight: 600 }}><span>Từ vựng</span><span>Nghĩa</span><span /></div>
        {ex.vocab.map((v, i) => (<div key={i} style={rowStyle}><input style={inp} placeholder="VD: Biodiversity" value={v.word} onChange={e => uVocab(i, 'word', e.target.value)} /><input style={inp} placeholder="Nghĩa" value={v.meaning} onChange={e => uVocab(i, 'meaning', e.target.value)} /><button style={rmBtn} onClick={() => setEx(e => ({ ...e, vocab: e.vocab.filter((_, j) => j !== i) }))}>✕</button></div>))}
        <button style={addRowBtn} onClick={() => setEx(e => ({ ...e, vocab: [...e.vocab, emptyVocabRow()] }))}>+ Thêm từ vựng</button>
        <div style={sec}>❓ Câu hỏi &amp; Đáp án</div>
        {ex.readingQuestions.map((q, i) => (<div key={i} style={qBlock}><div style={{ fontSize: 12, fontWeight: 700, color: '#F95800', marginBottom: 8 }}>Câu {i + 1}</div><div className={styles.form} style={{ marginBottom: 0 }}><div className={styles.full}><label>Câu hỏi</label><input style={inp} value={q.text} onChange={e => uRQ(i, 'text', e.target.value)} /></div><div className={styles.full}><label>Đáp án</label><input style={{ ...inp, borderColor: '#86efac', background: '#f0fdf4' }} value={q.answer} onChange={e => uRQ(i, 'answer', e.target.value)} /></div></div><button style={{ ...rmBtn, marginTop: 8, fontSize: 12, color: '#ef4444' }} onClick={() => setEx(e => ({ ...e, readingQuestions: e.readingQuestions.filter((_, j) => j !== i) }))}>✕ Xóa</button></div>))}
        <button style={addRowBtn} onClick={() => setEx(e => ({ ...e, readingQuestions: [...e.readingQuestions, { text: '', answer: '' }] }))}>+ Thêm câu hỏi</button>
        {renderUploadSection(isEdit)}
      </>
    )

    if (cat === 'Listening') return (
      <>
        <div style={sec}>🎯 Mục tiêu bài nghe</div>
        {ex.objectives.map((o, i) => (<div key={i} style={row1Style}><input style={inp} placeholder="VD: Hiểu hội thoại mua sắm cơ bản" value={o} onChange={e => uObj(i, e.target.value)} /><button style={rmBtn} onClick={() => setEx(e => ({ ...e, objectives: e.objectives.filter((_, j) => j !== i) }))}>✕</button></div>))}
        <button style={addRowBtn} onClick={() => setEx(e => ({ ...e, objectives: [...e.objectives, ''] }))}>+ Thêm mục tiêu</button>
        <div style={sec}>❓ Câu hỏi</div>
        {ex.listenQuestions.map((q, i) => (<div key={i} style={qBlock}><div style={{ fontSize: 12, fontWeight: 700, color: '#F95800', marginBottom: 8 }}>Câu {i + 1}</div><div className={styles.form} style={{ marginBottom: 0 }}><div className={styles.full}><label>Câu hỏi</label><input style={inp} value={q.text} onChange={e => uLQ(i, 'text', e.target.value)} /></div><div className={styles.full}><label>Đáp án (phân cách dấu phẩy)</label><input style={inp} value={q.options} onChange={e => uLQ(i, 'options', e.target.value)} /></div><div><label>Đáp án đúng</label><input style={inp} value={q.answer} onChange={e => uLQ(i, 'answer', e.target.value)} /></div></div><button style={{ ...rmBtn, marginTop: 8, fontSize: 12, color: '#ef4444' }} onClick={() => setEx(e => ({ ...e, listenQuestions: e.listenQuestions.filter((_, j) => j !== i) }))}>✕ Xóa</button></div>))}
        <button style={addRowBtn} onClick={() => setEx(e => ({ ...e, listenQuestions: [...e.listenQuestions, { text: '', options: '', answer: '' }] }))}>+ Thêm câu hỏi</button>
        {renderUploadSection(isEdit)}
      </>
    )

    if (cat === 'Speaking') return (
      <>
        <div style={sec}>🎤 Thông tin bài luyện nói</div>
        <div className={styles.form}>
          <div className={styles.full}><label>Chủ đề</label><input style={inp} placeholder="VD: Shopping, Job Interview..." value={ex.speakingTopics} onChange={e => setEx(ex2 => ({ ...ex2, speakingTopics: e.target.value }))} /></div>
          <div><label>Mức độ</label><select style={inp} value={ex.speakingLevel} onChange={e => setEx(ex2 => ({ ...ex2, speakingLevel: e.target.value }))}><option value="Easy">Dễ</option><option value="Medium">Trung bình</option><option value="Hard">Khó</option></select></div>
          <div className={styles.full}><label>Gợi ý phát âm</label><input style={inp} value={ex.speakingTips} onChange={e => setEx(ex2 => ({ ...ex2, speakingTips: e.target.value }))} /></div>
        </div>
        <div style={sec}>🔊 Câu luyện nói</div>
        {ex.speakingPhrases.map((ph, i) => (<div key={i} style={{ background: '#fdf8f3', border: '1px solid #f0e4d4', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 12.5, fontWeight: 700, color: '#F95800' }}>Câu {i + 1}</span><button style={{ ...rmBtn, color: '#ef4444', fontSize: 12 }} onClick={() => setEx(e => ({ ...e, speakingPhrases: e.speakingPhrases.filter((_, j) => j !== i) }))}>✕ Xóa</button></div><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><div><label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>🇬🇧 Tiếng Anh</label><input style={inp} value={ph.text} onChange={e => uPhrase(i, 'text', e.target.value)} /></div><div><label style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', display: 'block', marginBottom: 4 }}>🔡 IPA</label><input style={{ ...inp, fontStyle: 'italic', color: '#2563eb' }} value={ph.phonetic} onChange={e => uPhrase(i, 'phonetic', e.target.value)} /></div><div><label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>🇻🇳 Dịch nghĩa</label><input style={inp} value={ph.translation} onChange={e => uPhrase(i, 'translation', e.target.value)} /></div></div></div>))}
        <button style={addRowBtn} onClick={() => setEx(ex2 => ({ ...ex2, speakingPhrases: [...ex2.speakingPhrases, emptyPhrase()] }))}>+ Thêm câu luyện nói</button>
        {renderUploadSection(isEdit)}
      </>
    )
    return null
  }

  const renderViewVocabulary = (parsed: any) => {
    const vSec: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: '#F95800', margin: '16px 0 8px', paddingBottom: 5, borderBottom: '1.5px solid #fde8d4' }
    const vocabList: VocabRow[] = Array.isArray(parsed.vocabList) ? parsed.vocabList : []
    const autoEx = (w: string, m: string) => `The word "${w}" means "${m}" in Vietnamese.`
    return (
      <>
        {parsed.theme && (<div style={{ display: 'inline-block', padding: '4px 14px', background: '#fff3e0', color: '#F95800', border: '1px solid #fde8d4', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{parsed.theme}</div>)}
        {vocabList.length > 0 && (
          <>
            <div style={{ border: '1px solid #e0d8cc', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f5f0e8', padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#555', borderBottom: '1px solid #e0d8cc' }}><span>Từ vựng</span><span>Nghĩa tiếng Việt</span></div>
              {vocabList.map((v, i) => (<div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 16px', fontSize: 13, borderBottom: i < vocabList.length - 1 ? '1px solid #f0e8de' : 'none', background: i % 2 === 0 ? '#fff' : '#fdf8f3' }}><span style={{ fontWeight: 500 }}>{i + 1}. {v.word}</span><span style={{ color: '#555' }}>{v.meaning}</span></div>))}
            </div>
            {vocabList.some(v => v.word && v.meaning) && (
              <><div style={vSec}>💡 Ví dụ sử dụng</div>{vocabList.filter(v => v.word && v.meaning).map((v, i) => (<div key={i} style={{ marginBottom: 10 }}><div style={{ fontWeight: 700, fontSize: 13, fontStyle: 'italic', marginBottom: 3 }}>{v.word}</div><div style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'flex-start', gap: 6 }}><span style={{ color: '#F95800', flexShrink: 0 }}>➡</span><span>{v.example || autoEx(v.word, v.meaning)}</span></div></div>))}</>
            )}
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, padding: '10px 14px', marginTop: 8, fontSize: 12.5 }}>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>🎯 Bài luyện tập: </span>
              <span style={{ color: '#374151' }}>Quiz trắc nghiệm "What is the meaning of...?" với {vocabList.length} từ — tối đa 8 câu hỏi</span>
            </div>
          </>
        )}
      </>
    )
  }

  const renderViewWriting = (parsed: any) => {
    const vSec: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: '#F95800', margin: '16px 0 8px', paddingBottom: 5, borderBottom: '1.5px solid #fde8d4' }
    const vBox: React.CSSProperties = { background: '#fdf8f3', border: '1px solid #f0e4d4', borderRadius: 10, padding: '12px 14px', marginBottom: 8, fontSize: 13 }
    const vTag: React.CSSProperties = { display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginRight: 6 }
    return (
      <>
        {parsed.prompt && (<><div style={vSec}>✍️ Đề bài</div><div style={vBox}>{parsed.prompt}</div></>)}
        {Array.isArray(parsed.sentences) && parsed.sentences.length > 0 && (
          <><div style={vSec}>🔀 Câu luyện tập ({parsed.sentences.length} câu)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {parsed.sentences.map((s: string, i: number) => (<div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '9px 12px', fontSize: 13 }}><span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#F95800', borderRadius: 4, padding: '2px 7px', minWidth: 22, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span><span style={{ lineHeight: 1.5 }}>{s}</span></div>))}
            </div>
          </>
        )}
        {parsed.samples && Object.entries(parsed.samples).some(([, v]) => v) && (
          <><div style={vSec}>📝 Bài mẫu CEFR</div>
            {(Object.entries(parsed.samples) as [CefrLevel, string][]).filter(([, v]) => v).map(([lvl, txt]) => { const c = cefrColor[lvl]; return (<div key={lvl} style={{ marginBottom: 10 }}><span style={{ ...vTag, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{lvl}</span><div style={{ ...vBox, marginTop: 6, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{txt}</div></div>) })}
          </>
        )}
      </>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Quản lý kỹ năng học Tiếng Anh</h1>
        <p className={styles.subTitle}>Thêm mới, sửa, xóa, duyệt các bài học kỹ năng</p>
      </div>
      <div className={styles.searchBox}>
        <input placeholder="Tìm kiếm bài học..." value={search} onChange={e => setSearch(e.target.value)} />
        <button>🔍</button>
      </div>
      <div className={styles.stats}>
        <div className={`${styles.box} ${styles.box1}`}><p>Tổng bài học</p><h2>{totalLesson}</h2></div>
        <div className={`${styles.box} ${styles.box2}`}><p>Đang hoạt động</p><h2>{activeLesson}</h2></div>
        <div className={`${styles.box} ${styles.box3}`}><p>Chờ duyệt</p><h2>{pendingLesson}</h2></div>
        <div className={`${styles.box} ${styles.box4}`}><p>Số người tạo</p><h2>{teacherCount}</h2></div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div><h3>Danh sách kỹ năng học Tiếng Anh</h3><p className={styles.subTitle}>Quản lý bài học Reading, Listening, Speaking, Writing, Grammar, Vocabulary</p></div>
          <div className={styles.actions}>
            <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}><option value="Tất cả">Tất cả kỹ năng</option>{SKILL_CATS.map(s => <option key={s}>{s}</option>)}</select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}><option value="Tất cả">Tất cả trạng thái</option><option value="Hoạt động">Hoạt động</option><option value="Chờ duyệt">Chờ duyệt</option><option value="Ẩn">Ẩn</option></select>
            <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>+ Thêm bài</button>
          </div>
        </div>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Đang tải...</div> : (
          <table className={styles.table}>
            <thead><tr><th>Tiêu đề</th><th>Kỹ năng</th><th>Cấp độ</th><th>Người tạo</th><th>Ngày tạo</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Không có bài học nào.</td></tr>
                : filtered.map(item => (
                  <tr key={item.MaBaiHocMo}>
                    <td className={styles.title}>{item.TieuDe}</td>
                    <td><span className={styles.badge}>{item.KyNang}</span></td>
                    <td>{item.CapDo}</td><td>{item.TenNguoiTao || '—'}</td>
                    <td>{item.NgayTao ? new Date(item.NgayTao).toLocaleDateString('vi-VN') : '—'}</td>
                    <td><span style={{ background: statusColor[item.TrangThai]?.bg ?? '#eee', color: statusColor[item.TrangThai]?.color ?? '#333', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{item.TrangThai}</span></td>
                    <td>
                      <button style={{ marginRight: 6, padding: '4px 10px', borderRadius: 6, border: '1px solid #F95800', background: '#fff', color: '#F95800', cursor: 'pointer', fontSize: 12 }} onClick={() => { setSelectedLesson(item); setShowViewModal(true) }}>Xem</button>
                      <button style={{ marginRight: 6, padding: '4px 10px', borderRadius: 6, border: '1px solid #3b82f6', background: '#fff', color: '#3b82f6', cursor: 'pointer', fontSize: 12 }} onClick={() => openEdit(item)}>Sửa</button>
                      <button style={{ marginRight: 6, padding: '4px 10px', borderRadius: 6, border: 'none', background: item.TrangThai === 'Hoạt động' ? '#f3f4f6' : '#dcfce7', color: item.TrangThai === 'Hoạt động' ? '#6b7280' : '#16a34a', cursor: 'pointer', fontSize: 12 }} onClick={() => handleToggleStatus(item)}>{item.TrangThai === 'Hoạt động' ? 'Ẩn' : 'Hiện'}</button>
                      <button style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
                        onClick={() => handleDelete(item.MaBaiHocMo, item.TieuDe)}>Xóa</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL THÊM ──────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ width: 700, maxWidth: '95vw' }}>
            <div className={styles.modalHeader}>
              <div><h2>Thêm bài học kỹ năng mới</h2><p>Bài học sẽ ở trạng thái "Chờ duyệt" sau khi tạo</p></div>
              <span className={styles.close} onClick={() => setShowAddModal(false)}>×</span>
            </div>
            <div style={sec}>📋 Thông tin chung</div>
            <div className={styles.form}>
              <div className={styles.full}><label>Tiêu đề bài học <span style={{ color: 'red' }}>*</span></label><input placeholder="VD: Vocabulary: Technology & Internet" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} /></div>
              <div><label>Kỹ năng</label><select value={newLesson.category} onChange={e => { setNewLesson({ ...newLesson, category: e.target.value }); setActiveCefr('B1'); setExtra(emptyExtra()); setUploadedFileObjects([]) }}>{SKILL_CATS.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label>Cấp độ</label><select value={newLesson.level} onChange={e => setNewLesson({ ...newLesson, level: e.target.value })}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
              <div className={styles.full}><label>Mô tả ngắn</label><input placeholder="VD: Từ vựng công nghệ và internet thông dụng" value={newLesson.desc} onChange={e => setNewLesson({ ...newLesson, desc: e.target.value })} /></div>
            </div>
            {renderSkillFields(false)}
            <div className={styles.modalButtons}>
              <button className={styles.cancel} onClick={() => setShowAddModal(false)}>Hủy</button>
              <button className={styles.save} onClick={handleAdd} disabled={uploading}>{uploading ? 'Đang upload...' : 'Thêm bài học'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL XEM ───────────────────────────────────────────────────────── */}
      {showViewModal && selectedLesson && (() => {
        const parsed = (() => { try { return JSON.parse(selectedLesson.NoiDung || '{}') } catch { return {} } })()
        const ky = selectedLesson.KyNang
        const vSec: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: '#F95800', margin: '16px 0 8px', paddingBottom: 5, borderBottom: '1.5px solid #fde8d4' }
        const vTag: React.CSSProperties = { display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginRight: 6, marginBottom: 4 }
        const vBox: React.CSSProperties = { background: '#fdf8f3', border: '1px solid #f0e4d4', borderRadius: 10, padding: '12px 14px', marginBottom: 8, fontSize: 13 }
        const renderContent = () => {
          if (ky === 'Writing')    return renderViewWriting(parsed)
          if (ky === 'Vocabulary') return renderViewVocabulary(parsed)
          if (ky === 'Reading') return (<>{parsed.passage && (<><div style={vSec}>📖 Bài đọc</div><div style={{ ...vBox, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{parsed.passage}</div></>)}{Array.isArray(parsed.vocab) && parsed.vocab.length > 0 && (<><div style={vSec}>📝 Từ vựng</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{parsed.vocab.map((v: any, i: number) => (<div key={i} style={{ background: '#fff', border: '1px solid #e0d8cc', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}><strong>{v.word}</strong>{v.meaning ? <span style={{ color: '#888', marginLeft: 6 }}>— {v.meaning}</span> : null}</div>))}</div></>)}{Array.isArray(parsed.questions) && parsed.questions.length > 0 && (<><div style={vSec}>❓ Câu hỏi</div>{parsed.questions.map((q: any, i: number) => (<div key={i} style={vBox}><span style={{ fontWeight: 700, color: '#F95800' }}>Câu {i + 1}. </span>{q.text || q}{q.answer && <div style={{ marginTop: 6, color: '#16a34a', fontSize: 12.5 }}>✅ {q.answer}</div>}</div>))}</>)}</>)
          if (ky === 'Listening') return (<>{Array.isArray(parsed.objectives) && parsed.objectives.length > 0 && (<><div style={vSec}>🎯 Mục tiêu</div><ul style={{ margin: '0 0 8px', paddingLeft: 20 }}>{parsed.objectives.map((o: string, i: number) => <li key={i} style={{ fontSize: 13, marginBottom: 4 }}>{o}</li>)}</ul></>)}{Array.isArray(parsed.questions) && parsed.questions.length > 0 && (<><div style={vSec}>❓ Câu hỏi</div>{parsed.questions.map((q: any, i: number) => (<div key={i} style={vBox}><div style={{ fontWeight: 700, color: '#F95800', marginBottom: 4 }}>Câu {i + 1}. {q.text || q}</div>{q.options && <div style={{ color: '#555', fontSize: 12.5, marginBottom: 4 }}>Lựa chọn: {q.options}</div>}{q.answer && <div style={{ color: '#16a34a', fontSize: 12.5 }}>✅ {q.answer}</div>}</div>))}</>)}</>)
          if (ky === 'Speaking') return (<><div style={vSec}>🎤 Thông tin</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>{parsed.topics && <span style={{ ...vTag, background: '#fff3e0', color: '#F95800' }}>📌 {parsed.topics}</span>}{parsed.level && <span style={{ ...vTag, background: '#dbeafe', color: '#1d4ed8' }}>⚡ {parsed.level}</span>}</div>{parsed.tips && <div style={{ ...vBox, color: '#555' }}>💡 {parsed.tips}</div>}{Array.isArray(parsed.phrases) && parsed.phrases.length > 0 && (<><div style={vSec}>🔊 Câu luyện nói</div>{parsed.phrases.map((p: any, i: number) => (<div key={i} style={vBox}><div style={{ fontWeight: 700, marginBottom: 4 }}>🇬🇧 {p.text}</div>{p.phonetic && <div style={{ color: '#2563eb', fontStyle: 'italic', fontSize: 12.5, marginBottom: 2 }}>/{p.phonetic}/</div>}{p.translation && <div style={{ color: '#555', fontSize: 12.5 }}>🇻🇳 {p.translation}</div>}</div>))}</>)}</>)
          if (ky === 'Grammar') return (<>{parsed.subtitle && (<><div style={vSec}>📐 Tiêu đề phụ</div><div style={{ ...vBox, fontWeight: 600 }}>{parsed.subtitle}</div></>)}{parsed.explanation && (<><div style={vSec}>📖 Lý thuyết</div><div style={{ ...vBox, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{parsed.explanation}</div></>)}{parsed.exercises && (<><div style={vSec}>✏️ Bài tập ({parsed.exercises.split('\n').filter((l: string) => l.trim()).length} câu)</div><div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{parsed.exercises.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => { const match = line.match(/^\d+\.\s(.+?)\s*→\s*(.+)$/); return (<div key={i} style={{ ...vBox, margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#F95800', borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>{i + 1}</span><div><span>{match ? match[1] : line}</span>{match && <span style={{ marginLeft: 8, color: '#16a34a', fontWeight: 600 }}>→ {match[2]}</span>}</div></div>) })}</div></>)}</>)
          return <div style={{ color: '#aaa', fontSize: 13 }}>Không có nội dung.</div>
        }
        return (
          <div className={styles.modalOverlay}>
            <div className={styles.modal} style={{ width: 700, maxWidth: '95vw' }}>
              <div className={styles.modalHeader}>
                <div><h2>{selectedLesson.TieuDe}</h2><div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}><span className={styles.badge}>{selectedLesson.KyNang}</span><span style={{ background: statusColor[selectedLesson.TrangThai]?.bg ?? '#eee', color: statusColor[selectedLesson.TrangThai]?.color ?? '#333', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{selectedLesson.TrangThai}</span>{selectedLesson.CapDo && <span style={{ background: '#f3f4f6', color: '#555', padding: '3px 12px', borderRadius: 20, fontSize: 12 }}>{selectedLesson.CapDo}</span>}</div></div>
                <span className={styles.close} onClick={() => setShowViewModal(false)}>×</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '12px 0', background: '#fafafa', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                <div><span style={{ color: '#aaa' }}>Người tạo: </span><strong>{selectedLesson.TenNguoiTao || '—'}</strong></div>
                <div><span style={{ color: '#aaa' }}>Ngày tạo: </span><strong>{selectedLesson.NgayTao ? new Date(selectedLesson.NgayTao).toLocaleDateString('vi-VN') : '—'}</strong></div>
                {selectedLesson.MoTa && <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#aaa' }}>Mô tả: </span><strong>{selectedLesson.MoTa}</strong></div>}
              </div>
              <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: 4 }}>{renderContent()}</div>
              <div className={styles.modalButtons} style={{ marginTop: 16 }}>
                <button className={styles.cancel} onClick={() => setShowViewModal(false)}>Đóng</button>
                <button className={styles.edit} style={{ padding: '10px 18px' }} onClick={() => { openEdit(selectedLesson); setShowViewModal(false) }}>Sửa bài</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── MODAL SỬA ───────────────────────────────────────────────────────── */}
      {showEditModal && selectedLesson && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ width: 700, maxWidth: '95vw' }}>
            <div className={styles.modalHeader}>
              <div><h2>Sửa bài học kỹ năng</h2><p>Chỉnh sửa nội dung và thông tin bài học</p></div>
              <span className={styles.close} onClick={() => setShowEditModal(false)}>×</span>
            </div>
            <div style={sec}>📋 Thông tin chung</div>
            <div className={styles.form}>
              <div className={styles.full}><label>Tiêu đề <span style={{ color: 'red' }}>*</span></label><input value={editLesson.title} onChange={e => setEditLesson({ ...editLesson, title: e.target.value })} /></div>
              <div><label>Kỹ năng</label><select value={editLesson.category} onChange={e => { setEditLesson({ ...editLesson, category: e.target.value }); setEditActiveCefr('B1'); setEditExtra(emptyExtra()); setEditUploadedFileObjects([]) }}>{SKILL_CATS.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label>Cấp độ</label><select value={editLesson.level} onChange={e => setEditLesson({ ...editLesson, level: e.target.value })}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
              <div className={styles.full}><label>Mô tả ngắn</label><input value={editLesson.desc} onChange={e => setEditLesson({ ...editLesson, desc: e.target.value })} /></div>
              <div className={styles.full}><label>Trạng thái</label><select value={editLesson.status} onChange={e => setEditLesson({ ...editLesson, status: e.target.value as ApprovalStatus })}><option value="Hoạt động">Hoạt động</option><option value="Chờ duyệt">Chờ duyệt</option><option value="Ẩn">Ẩn</option></select></div>
            </div>
            {renderSkillFields(true)}
            <div className={styles.modalButtons}>
              <button className={styles.cancel} onClick={() => setShowEditModal(false)}>Hủy</button>
              <button className={styles.save} onClick={handleSaveEdit} disabled={editUploading}>{editUploading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: XÁC NHẬN XÓA ════ */}
      {showDeleteModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}
          onClick={() => { setShowDeleteModal(false); setDeleteAction(null) }}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', minWidth: 340, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #e57373', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#e57373', fontSize: 24, fontWeight: 700 }}>!</div>
            <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 700, color: '#222' }}>Xác nhận Xóa</h3>
            <p style={{ color: '#777', marginBottom: 24, fontSize: 14 }}>{deleteMessage}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={async () => {
                  if (deleteAction) { try { await deleteAction() } catch { showToast('Lỗi khi thực hiện!', 'warn') } }
                  setShowDeleteModal(false); setDeleteAction(null)
                }}
                style={{ padding: '12px', borderRadius: 8, border: 'none', background: '#ef9a9a', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}
              >Xác nhận</button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteAction(null) }}
                style={{ padding: '12px', borderRadius: 8, border: 'none', background: '#f5f5f5', color: '#555', cursor: 'pointer', fontWeight: 500, fontSize: 15 }}
              >Không</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${toastType === 'warn' ? styles.toastWarn : ''}`}>{toast}</div>}
    </div>
  )
}

export default KyNangPage
