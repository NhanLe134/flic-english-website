export const DAYS_OF_WEEK = [
  { label: 'T2', value: 'Thứ 2' },
  { label: 'T3', value: 'Thứ 3' },
  { label: 'T4', value: 'Thứ 4' },
  { label: 'T5', value: 'Thứ 5' },
  { label: 'T6', value: 'Thứ 6' },
  { label: 'T7', value: 'Thứ 7' },
  { label: 'CN', value: 'Chủ nhật' },
];

export const START_TIME_OPTIONS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
];

export const END_TIME_OPTIONS = [
  "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
];

export const parseSchedule = (schedule: string) => {
  const daySchedules: Record<string, { startTime: string; endTime: string }> = {};
  const selectedDays: string[] = [];

  if (!schedule || schedule === '—') {
    return { days: '', daySchedules };
  }

  const parts = schedule.split('·').map(p => p.trim());
  let isNewFormat = true;
  
  if (parts.length === 0 || parts[0] === '') {
    isNewFormat = false;
  } else {
    for (const part of parts) {
      const match = part.match(/^(.+?)\s*\(([^)]+)\)$/);
      if (!match) {
        isNewFormat = false;
        break;
      }
    }
  }

  if (isNewFormat) {
    parts.forEach(part => {
      const match = part.match(/^(.+?)\s*\(([^)]+)\)$/);
      if (match) {
        const day = match[1].trim();
        const timeStr = match[2].trim();
        const times = timeStr.split('-');
        const startTime = times[0] ? times[0].trim() : '07:00';
        const endTime = times[1] ? times[1].trim() : '08:30';
        
        const matchedDay = DAYS_OF_WEEK.find(d => d.value.toLowerCase() === day.toLowerCase());
        if (matchedDay) {
          if (!selectedDays.includes(matchedDay.value)) {
            selectedDays.push(matchedDay.value);
          }
          daySchedules[matchedDay.value] = { startTime, endTime };
        }
      }
    });
  } else {
    let daysPart = '';
    let timePart = '';
    
    if (schedule.includes('·')) {
      const partsOld = schedule.split('·');
      daysPart = partsOld[0].trim();
      timePart = partsOld[1] ? partsOld[1].trim() : '';
    } else if (schedule.includes('-') && (schedule.includes(':') || /^\d{2}/.test(schedule))) {
      timePart = schedule.trim();
    } else {
      daysPart = schedule.trim();
    }

    let commonStartTime = '07:00';
    let commonEndTime = '08:30';
    if (timePart) {
      const times = timePart.split('-');
      if (times[0]) commonStartTime = times[0].trim();
      if (times[1]) commonEndTime = times[1].trim();
    }

    const extractedDays: string[] = [];
    
    if (daysPart.toLowerCase().includes('chủ nhật')) {
      extractedDays.push('Chủ nhật');
    }
    
    const thuMatch = daysPart.match(/Thứ\s+([^&·\(\)]+)/i);
    if (thuMatch) {
      const cleanParts = thuMatch[1].replace(/Thứ/gi, '').split(',').map(s => s.trim());
      cleanParts.forEach(p => {
        if (p.includes('&')) {
          p.split('&').forEach(sp => {
            const cleanSp = sp.trim();
            if (cleanSp && !isNaN(Number(cleanSp))) {
              extractedDays.push(`Thứ ${cleanSp}`);
            }
          });
        } else {
          if (p && !isNaN(Number(p))) {
            extractedDays.push(`Thứ ${p}`);
          }
        }
      });
    }
    
    const ampMatch = daysPart.match(/&\s*(\d+)/);
    if (ampMatch) {
      const num = ampMatch[1];
      const dayStr = `Thứ ${num}`;
      if (!extractedDays.includes(dayStr)) {
        extractedDays.push(dayStr);
      }
    }

    DAYS_OF_WEEK.forEach(d => {
      if (daysPart.toLowerCase().includes(d.value.toLowerCase()) && !extractedDays.includes(d.value)) {
        extractedDays.push(d.value);
      }
    });

    extractedDays.forEach(day => {
      const matchedDay = DAYS_OF_WEEK.find(d => d.value.toLowerCase() === day.toLowerCase());
      if (matchedDay) {
        if (!selectedDays.includes(matchedDay.value)) {
          selectedDays.push(matchedDay.value);
        }
        daySchedules[matchedDay.value] = { startTime: commonStartTime, endTime: commonEndTime };
      }
    });
  }

  selectedDays.sort((a, b) => {
    const idxA = DAYS_OF_WEEK.findIndex(d => d.value === a);
    const idxB = DAYS_OF_WEEK.findIndex(d => d.value === b);
    return idxA - idxB;
  });

  return {
    days: selectedDays.join(', '),
    daySchedules
  };
};

export const serializeSchedule = (
  selectedDaysStr: string,
  daySchedules: Record<string, { startTime: string; endTime: string }>
) => {
  if (!selectedDaysStr) return '—';
  
  const days = selectedDaysStr.split(',').map(d => d.trim()).filter(Boolean);
  
  days.sort((a, b) => {
    const idxA = DAYS_OF_WEEK.findIndex(d => d.value === a);
    const idxB = DAYS_OF_WEEK.findIndex(d => d.value === b);
    return idxA - idxB;
  });

  if (days.length === 0) return '—';

  const scheduleParts = days.map(day => {
    const sched = daySchedules[day] || { startTime: '07:00', endTime: '08:30' };
    return `${day} (${sched.startTime}-${sched.endTime})`;
  });

  return scheduleParts.join(' · ');
};

export const getSkillId = (skillName: string): number => {
  switch (skillName.toLowerCase()) {
    case 'listening': return 1;
    case 'reading': return 2;
    case 'speaking': return 3;
    case 'writing': return 4;
    default: return 0;
  }
};
