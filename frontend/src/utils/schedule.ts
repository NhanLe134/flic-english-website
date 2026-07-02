export const formatScheduleOnlyDays = (schedule: string): string => {
  if (!schedule) return "—";
  
  // 1. Remove parentheses containing times e.g. " (07:00-08:30)" or " (7:00 - 8:30)"
  let clean = schedule.replace(/\s*\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)/g, "");
  
  // 2. Remove trailing time after comma or hyphen e.g. " - 9:00-10:30" or ", 18:00-20:00"
  // Matches a separator (comma, hyphen, or space) followed by time like 9:00-10:30, 9h-10h, etc.
  clean = clean.replace(/[\s,-]+\d{1,2}(?::\d{2}|h)(?:\s*-\s*\d{1,2}(?::\d{2}|h))?.*$/, "");
  
  return clean.trim() || schedule;
};
