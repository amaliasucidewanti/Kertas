
import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

const AssignmentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 4, 1)); // May 2024
  
  const tasks = dataService.getPenugasan();
  const employees = dataService.getPegawai();

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDayStatus = (day: number | null) => {
    if (!day) return null;
    const dateStr = `2024-05-${day.toString().padStart(2, '0')}`;
    const taskOnDay = tasks.filter(t => dateStr >= t.tanggalMulai && dateStr <= t.tanggalSelesai);
    return taskOnDay;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft size={20} /></button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest border-r last:border-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dailyTasks = getDayStatus(day);
            return (
              <div key={idx} className="min-h-[140px] p-2 border-r border-b last:border-r-0 hover:bg-slate-50 transition-colors">
                {day && (
                  <>
                    <span className="text-sm font-bold text-slate-600">{day}</span>
                    <div className="mt-2 space-y-1">
                      {dailyTasks?.slice(0, 3).map((t, tid) => (
                        <div key={tid} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 truncate flex items-center gap-1">
                          <User size={8} /> {t.namaPegawai}
                        </div>
                      ))}
                      {dailyTasks && dailyTasks.length > 3 && (
                        <div className="text-[9px] text-slate-400 text-center">+{dailyTasks.length - 3} lainnya</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
          <span className="text-xs text-slate-500">Pegawai Bertugas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-200 rounded-sm"></div>
          <span className="text-xs text-slate-500">Pegawai Tersedia</span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCalendar;
