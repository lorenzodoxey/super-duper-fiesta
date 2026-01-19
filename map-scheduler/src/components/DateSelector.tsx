import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import './DateSelector.css';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMonth, setViewMonth] = useState(selectedDate);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; right: number } | null>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showCalendar && calendarButtonRef.current) {
      const rect = calendarButtonRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showCalendar]);

  const days = [];
  const startDate = subDays(selectedDate, 3);

  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i));
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);
  const calendarDays = [...emptyDays, ...daysInMonth];

  return (
    <>
      <div className="date-selector">
        <button className="date-nav" onClick={() => onDateChange(subDays(selectedDate, 1))}>
          <ChevronLeft size={18} />
        </button>

        <div className="date-pills">
          {days.map((day, idx) => (
            <button
              key={idx}
              className={`date-pill ${isSameDay(day, selectedDate) ? 'active' : ''}`}
              onClick={() => onDateChange(day)}
            >
              <div className="pill-day">{format(day, 'EEE')}</div>
              <div className="pill-date">{format(day, 'd')}</div>
            </button>
          ))}
        </div>

        <button className="date-nav" onClick={() => onDateChange(addDays(selectedDate, 1))}>
          <ChevronRight size={18} />
        </button>

        <button 
          ref={calendarButtonRef}
          className="date-nav calendar-toggle" 
          onClick={() => setShowCalendar(!showCalendar)}
          title="Open calendar"
        >
          <Calendar size={18} />
        </button>
      </div>

      {showCalendar && (
        <>
          <div className="calendar-overlay" onClick={() => setShowCalendar(false)} />
          <div 
            className="calendar-dropdown"
            style={dropdownStyle ? { top: `${dropdownStyle.top}px`, right: `${dropdownStyle.right}px` } : {}}
          >
            <div className="calendar-header">
              <button 
                className="calendar-nav"
                onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="calendar-month-year">
                <select 
                  value={viewMonth.getMonth()}
                  onChange={(e) => {
                    const newMonth = new Date(viewMonth);
                    newMonth.setMonth(parseInt(e.target.value));
                    setViewMonth(newMonth);
                  }}
                  className="calendar-month-select"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>

                <select 
                  value={viewMonth.getFullYear()}
                  onChange={(e) => {
                    const newMonth = new Date(viewMonth);
                    newMonth.setFullYear(parseInt(e.target.value));
                    setViewMonth(newMonth);
                  }}
                  className="calendar-year-select"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button 
                className="calendar-nav"
                onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((day, idx) => (
                <button
                  key={idx}
                  className={`calendar-day ${day && isSameDay(day, selectedDate) ? 'selected' : ''} ${day ? '' : 'empty'}`}
                  onClick={() => {
                    if (day) {
                      onDateChange(day);
                      setShowCalendar(false);
                    }
                  }}
                  disabled={!day}
                >
                  {day ? format(day, 'd') : ''}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
