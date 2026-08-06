import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import type { StudentResult, LessonInfo, ExerciseHeader } from '../kieuDuLieu';

interface BaoCaoTheoGiangVienProps {
  filtered: StudentResult[];
  paginatedData: StudentResult[];
  allLessons: LessonInfo[];
  activeHeaders: ExerciseHeader[];
  uniqueBuois: number[];
  lecturerOptions: string[];
  filterLecturer: string;
  setFilterLecturer: (val: string) => void;
  lecturerClassNames: string[];
  searchText: string;
  setSearchText: (val: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  getBuoiAvg: (hv: StudentResult, buoiNum: number) => number | null;
  pillColor: (d: number | null) => string;
}

export default function BaoCaoTheoGiangVien({
  filtered,
  paginatedData,
  allLessons,
  activeHeaders,
  uniqueBuois,
  lecturerOptions,
  filterLecturer,
  setFilterLecturer,
  lecturerClassNames,
  searchText,
  setSearchText,
  currentPage,
  setCurrentPage,
  getBuoiAvg,
  pillColor,
}: BaoCaoTheoGiangVienProps) {

  const tongHV = filtered.length;
  const dangHoc = filtered.filter(s => s.status === 'Đang học').length;
  const hoanThanh = filtered.filter(s => s.status === 'Hoàn thành').length;
  const diemTBs = filtered.filter(s => s.diemTB !== null).map(s => s.diemTB as number);
  const diemTBchung = diemTBs.length > 0
    ? (diemTBs.reduce((a, b) => a + b, 0) / diemTBs.length).toFixed(2)
    : '—';

  const chartData = useMemo(() => {
    let trungBinhCount = 0;
    let khaCount = 0;
    let gioiCount = 0;

    filtered.forEach(s => {
      if (s.diemTB !== null) {
        if (s.diemTB < 5) trungBinhCount++;
        else if (s.diemTB < 8) khaCount++;
        else gioiCount++;
      }
    });

    const total = filtered.length;
    return [
      { name: 'Trung bình (<5)', value: trungBinhCount, color: '#ef4444', percent: total ? Math.round(trungBinhCount / total * 100) : 0 },
      { name: 'Khá (5-8)', value: khaCount, color: '#f59e0b', percent: total ? Math.round(khaCount / total * 100) : 0 },
      { name: 'Giỏi (≥8)', value: gioiCount, color: '#10b981', percent: total ? Math.round(gioiCount / total * 100) : 0 }
    ];
  }, [filtered]);

  return (
    <>
      <div className="chartSection">
        <div className="chartCard">
          <h3 className="chartTitle">
            Phân phối Điểm trung bình - Giảng viên: {filterLecturer || '—'}
          </h3>
          <div className="chartWrapper">
            {filtered.filter(s => s.diemTB !== null).length === 0 ? (
              <div className="emptyChart">Chưa có dữ liệu điểm học viên trong nhóm này</div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(245, 130, 32, 0.05)' }} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="infoCard">
          <div>
            <h3 className="infoTitle">Thông tin giảng viên</h3>
            <div className="infoGrid">
              <div className="infoItem">
                <span className="infoLabel">Giảng viên:</span>
                <span className="infoValue">{filterLecturer || '—'}</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Lớp phụ trách:</span>
                <div className="classScrollList">
                  {lecturerClassNames.length > 0 ? (
                    lecturerClassNames.map(name => (
                      <div key={name} className="classScrollItem">{name}</div>
                    ))
                  ) : (
                    <div className="classScrollEmpty">Chưa có lớp</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="infoStatsDivider"></div>
          <div className="infoStats">
            <div className="infoStatMini"><span className="statMiniLabel">Tổng sỹ số</span><span className="statMiniVal">{tongHV}</span></div>
            <div className="infoStatMini"><span className="statMiniLabel">Đang học</span><span className="statMiniVal">{dangHoc}</span></div>
            <div className="infoStatMini"><span className="statMiniLabel">Hoàn thành</span><span className="statMiniVal">{hoanThanh}</span></div>
            <div className="infoStatMini"><span className="statMiniLabel">ĐTB chung</span><span className="statMiniVal primaryColor">{diemTBchung}</span></div>
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="searchBox">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Tìm tên hoặc mã học viên..." />
        </div>
        <select value={filterLecturer} onChange={e => setFilterLecturer(e.target.value)}>
          {lecturerOptions.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="tableWrap">
        {filtered.length === 0 ? (
          <div className="empty">Không tìm thấy học viên nào phù hợp.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>HỌ VÀ TÊN</th>
                <th>MÃ HỌC VIÊN</th>
                <th>MSSV (TRƯỜNG)</th>
                <th>TRẠNG THÁI</th>
                {uniqueBuois.map(b => (
                  <th key={b} style={{ textAlign: 'center' }}>ĐIỂM TB BUỔI {b}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(s => (
                <tr key={s.studentId} className="dataRow">
                  <td>
                    <div className="boldText">{s.studentName}</div>
                  </td>
                  <td className="boldText">{s.studentId}</td>
                  <td className="boldText">{s.mssv || '—'}</td>
                  <td>
                    <span className={`pill ${s.status === 'Đang học' ? 'pillGreen' :
                      s.status === 'Hoàn thành' ? 'pillBlue' :
                        s.status === 'Tạm dừng' ? 'pillYellow' :
                          'pillRed'
                      }`}>
                      {s.status}
                    </span>
                  </td>
                  {uniqueBuois.map(b => {
                    const hvLessons = allLessons.filter(l => l.TenLop === s.className);
                    const hvActiveLesson = hvLessons.find(l => l.MaBuoiHoc === hvLessons[0]?.ActiveBuoiHocId);
                    const hvActiveThuTu = hvActiveLesson ? hvActiveLesson.ThuTu : Math.max(...hvLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0);

                    if (hvActiveThuTu === null || b > hvActiveThuTu) {
                      return <td key={b} className="emptyVal">—</td>;
                    }

                    const avg = getBuoiAvg(s, b);
                    const hasExs = activeHeaders.some(h => h.ThuTu === b && h.TenLop === s.className);
                    if (!hasExs) {
                      return <td key={b} className="emptyVal">—</td>;
                    }

                    return (
                      <td key={b} className="scoreCell">
                        {avg !== null ? (
                          <span className={`avgBadge ${pillColor(avg)}`}>{avg.toFixed(1)}</span>
                        ) : (
                          <span className="dimText">Chưa nộp</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 15 && (
        <div className="pagination">
          <button
            className="pageBtn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ◀
          </button>
          <span className="pageInfo">
            Trang <strong>{currentPage}</strong> / {Math.ceil(filtered.length / 15)}
          </span>
          <button
            className="pageBtn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filtered.length / 15)))}
            disabled={currentPage === Math.ceil(filtered.length / 15)}
          >
            ▶
          </button>
        </div>
      )}
    </>
  );
}
