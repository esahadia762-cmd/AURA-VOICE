import React, { useState } from 'react';
import {
  CalendarCheck2,
  Plus,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Appointment } from '../../../types';

export const AppointmentsTab: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { appointments, addAppointment, updateAppointmentStatus, assistants } = useData();

  const userOrgId = user?.organizationId || 'default_org';
  const orgAppointments = isSuperAdmin && !user?.organizationId
    ? appointments
    : appointments.filter((a) => a.organizationId === userOrgId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [assistantName, setAssistantName] = useState(assistants[0]?.name || 'Voice Assistant');
  const [notes, setNotes] = useState('');

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !scheduledTime) return;

    addAppointment({
      organizationId: userOrgId,
      contactName,
      contactEmail,
      contactPhone,
      scheduledTime,
      durationMinutes,
      assistantName,
      status: 'Confirmed',
      notes,
    });

    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setScheduledTime('');
    setNotes('');
    setShowAddModal(false);
  };

  const getStatusStyle = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40';
      case 'Pending':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/40';
      case 'Rescheduled':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-800/40';
      case 'Cancelled':
        return 'bg-red-950/80 text-red-400 border-red-800/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Appointments & Consultations</h2>
          <p className="text-xs text-slate-400">
            Bookings scheduled by your AI voice agents during customer conversations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {orgAppointments.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Appointments Scheduled</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Appointments scheduled directly by callers with your voice agents will synchronize into this calendar console.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all"
          >
            Create Reservation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orgAppointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{apt.contactName}</h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{apt.contactPhone}</div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getStatusStyle(
                      apt.status
                    )}`}
                  >
                    {apt.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-mono text-cyan-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(apt.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="text-slate-400">Duration: {apt.durationMinutes} minutes</div>
                  <div className="text-slate-400">Booked by: {apt.assistantName}</div>
                  {apt.notes && <div className="text-slate-300 italic pt-1">{apt.notes}</div>}
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">Actions</span>
                <div className="flex items-center gap-1.5">
                  {apt.status !== 'Confirmed' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')}
                      className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-medium transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                  {apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                      className="px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Schedule Appointment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Marcus Thorne"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 432-1098"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="marcus@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Booking Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Inquiry topic or agenda..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
