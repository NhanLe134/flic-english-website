// src/pages/EditUser.tsx
import { useState } from 'react'
import type  { User } from '../types'
import "./editUserAdmin.css"

interface Props {
  user: User
  onClose: () => void
  onSave: (u: User) => void
  onDelete: (id: number) => void
}

export default function EditUser({ user, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({ ...user })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-top">
          <h3>Chi tiết người dùng</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p className="modal-sub">Xem và chỉnh sửa thông tin người dùng trong hệ thống</p>

        <div className="form-group"><label>Tên đăng nhập</label><input value={form.username} onChange={e=>set('username',e.target.value)}/></div>
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
        <div className="form-group">
          <label>Trạng thái</label>
          <select value={form.status} onChange={e=>set('status',e.target.value)}>
            <option>Hoạt động</option><option>Khóa</option>
          </select>
        </div>
        <div className="form-group">
          <label>Vai trò</label>
          <select value={form.role} onChange={e=>set('role',e.target.value)}>
            <option>Học Viên</option><option>Giảng Viên</option><option>Quản Trị Viên</option>
          </select>
        </div>

        <div className="form-actions">
          <button className="btn btn-danger btn-sm" onClick={() => { if(confirm('Xóa người dùng này?')) { onDelete(user.id); onClose() } }}>Xóa</button>
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => { onSave(form as User); onClose() }}>Lưu</button>
        </div>
      </div>
    </div>
  )
}
