export interface Holiday {
  date: string
  name: string
}

// Australian + Victorian public holidays for 2026 plus key cultural moments.
// Source: vic.gov.au public holidays. Geekly is in Bendigo, VIC.
export const HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-01-26', name: 'Australia Day' },
  { date: '2026-02-14', name: "Valentine's Day" },
  { date: '2026-03-09', name: 'Labour Day (VIC)' },
  { date: '2026-04-03', name: 'Good Friday' },
  { date: '2026-04-04', name: 'Easter Saturday' },
  { date: '2026-04-05', name: 'Easter Sunday' },
  { date: '2026-04-06', name: 'Easter Monday' },
  { date: '2026-04-25', name: 'Anzac Day' },
  { date: '2026-05-10', name: "Mother's Day" },
  { date: '2026-06-08', name: "King's Birthday (VIC)" },
  { date: '2026-06-21', name: 'Winter Solstice' },
  { date: '2026-09-06', name: "Father's Day" },
  { date: '2026-09-25', name: 'AFL Grand Final Eve (VIC)' },
  { date: '2026-10-31', name: 'Halloween' },
  { date: '2026-11-03', name: 'Melbourne Cup Day (VIC)' },
  { date: '2026-12-24', name: 'Christmas Eve' },
  { date: '2026-12-25', name: 'Christmas Day' },
  { date: '2026-12-26', name: 'Boxing Day' },
  { date: '2026-12-31', name: "New Year's Eve" },
]
