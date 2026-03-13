'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isBlocked: boolean;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityPage() {
  const { data: session } = useSession();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    // Get profile ID first, then availability
    fetch('/api/artisans', { method: 'GET' })
      .then(() => {
        // Use a direct prisma query approach - fetch via bookings to find the profile
        return fetch('/api/bookings?limit=1');
      })
      .then((res) => res.json())
      .then(() => {
        // Try to get availability through a different method
        // We need the artisan profile ID - get it from the artisans search
        return fetch(`/api/artisans?q=${encodeURIComponent(session.user.name)}&limit=1`);
      })
      .then((res) => res.json())
      .then((data) => {
        const artisan = data.artisans?.[0];
        if (artisan) {
          setProfileId(artisan.id);
          return fetch(`/api/availability?artisanProfileId=${artisan.id}`);
        }
        throw new Error('Profile not found');
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.availability?.length > 0) {
          setSlots(data.availability);
        } else {
          // Initialize with default empty slots for Mon-Sat
          setSlots(
            Array.from({ length: 6 }, (_, i) => ({
              dayOfWeek: i + 1,
              startTime: '08:00',
              endTime: '18:00',
              isBlocked: false,
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setSlots(
          Array.from({ length: 6 }, (_, i) => ({
            dayOfWeek: i + 1,
            startTime: '08:00',
            endTime: '18:00',
            isBlocked: false,
          }))
        );
        setLoading(false);
      });
  }, [session]);

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string | boolean | number) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
    setSaved(false);
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isBlocked: false }]);
    setSaved(false);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slots.filter((s) => !s.isBlocked)),
      });
      if (res.ok) setSaved(true);
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)', maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Availability</h1>
          <p style={{ color: 'var(--color-neutral-500)' }}>Set your weekly working hours</p>
        </div>
        <Link href="/artisan/dashboard" className="btn btn-secondary btn-sm">← Dashboard</Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : (
        <>
          <div className="card card-body" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {slots.map((slot, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <select
                    className="form-input form-select"
                    value={slot.dayOfWeek}
                    onChange={(e) => updateSlot(i, 'dayOfWeek', parseInt(e.target.value))}
                    style={{ width: 140 }}
                  >
                    {dayNames.map((name, idx) => (
                      <option key={idx} value={idx}>{name}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    className="form-input"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                    style={{ width: 120 }}
                  />
                  <span style={{ color: 'var(--color-neutral-400)' }}>to</span>
                  <input
                    type="time"
                    className="form-input"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                    style={{ width: 120 }}
                  />
                  <button onClick={() => removeSlot(i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent-500)' }}>✕</button>
                </div>
              ))}
            </div>
            <button onClick={addSlot} className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-4)' }}>
              + Add time slot
            </button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <button onClick={saveAvailability} disabled={saving} className="btn btn-primary btn-lg">
              {saving ? <span className="spinner" style={{ width: 20, height: 20 }} /> : 'Save Availability'}
            </button>
            {saved && (
              <span style={{ color: 'var(--color-success-500)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                ✓ Saved successfully!
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
