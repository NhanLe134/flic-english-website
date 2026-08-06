import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#1e293b', fontSize: '13px' }}>{data.name}</p>
        <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#64748b' }}>
          ĐTB chung: <strong style={{ color: '#f58220', fontSize: '13.5px' }}>{data.value.toFixed(2)}</strong>
        </p>
        <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 0 8px 0' }} />
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#10b981', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span>Giỏi (≥8):</span> <strong>{data.gioiPercent}%</strong>
        </p>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#f59e0b', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span>Khá (5-8):</span> <strong>{data.khaPercent}%</strong>
        </p>
        <p style={{ margin: '0', fontSize: '12px', color: '#ef4444', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span>Trung bình (&lt;5):</span> <strong>{data.trungBinhPercent}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

interface BaoCaoTongHopHeThongProps {
  summaryLecturerData: any[];
  summaryClassData: any[];
  shouldStack: boolean;
}

export default function BaoCaoTongHopHeThong({
  summaryLecturerData,
  summaryClassData,
  shouldStack,
}: BaoCaoTongHopHeThongProps) {
  const numLecturers = summaryLecturerData.length;
  const numClasses = summaryClassData.length;

  return (
    <div className={shouldStack ? 'summaryChartsStacked' : 'summaryCharts'}>
      <div className="chartCard">
        <h3 className="chartTitle">So sánh Điểm trung bình giữa các Giảng viên</h3>
        <div className={numLecturers > 8 ? 'chartWrapperScrollable' : 'chartWrapper'}>
          <div 
            className={numLecturers > 8 ? 'chartInnerScrollable' : 'chartInner'} 
            style={{ '--chart-width': `${numLecturers * 90}px` } as React.CSSProperties}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={summaryLecturerData} margin={{ top: 10, right: 10, left: -10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  angle={-25} 
                  textAnchor="end" 
                  height={45} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis domain={[0, 10]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35} fill="#f58220" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="chartCard">
        <h3 className="chartTitle">So sánh Điểm trung bình giữa các Lớp học</h3>
        <div className={numClasses > 8 ? 'chartWrapperScrollable' : 'chartWrapper'}>
          <div 
            className={numClasses > 8 ? 'chartInnerScrollable' : 'chartInner'} 
            style={{ '--chart-width': `${numClasses * 90}px` } as React.CSSProperties}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={summaryClassData} margin={{ top: 10, right: 10, left: -10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  angle={-25} 
                  textAnchor="end" 
                  height={45} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis domain={[0, 10]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
