import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutesAPI, FamilyAPI, RegistrationAPI } from '../../lib/api';
import type { Route, Schedule, FamilyMember, Passenger } from '../../types';
import UserLayout from '../../components/Layout/UserLayout';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AlertCircle, Plus, Trash2, Upload, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { getApiErrorMessage } from '../../hooks/useApi';

const STEPS = [
  { id: 1, label: 'Pilih Rute' },
  { id: 2, label: 'Pilih Jadwal' },
  { id: 3, label: 'Penumpang' },
  { id: 4, label: 'Dokumen' },
  { id: 5, label: 'Ringkasan' },
];

function getAgeCategory(birthDate: string): string {
  if (!birthDate) return '';
  const age = differenceInYears(new Date(), new Date(birthDate));
  if (age < 3) return 'Bayi';
  if (age < 12) return 'Anak-anak';
  if (age < 17) return 'Remaja';
  return 'Dewasa';
}

const emptyPassenger = (): Passenger => ({
  name: '', nik: '', birth_date: '', gender: 'L',
  identity_type: 'KTP', phone: '', address: '',
});

export default function DaftarMudikPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([emptyPassenger()]);
  const [documents, setDocuments] = useState<Record<number, File | null>>({});
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState('');
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  useEffect(() => {
    RoutesAPI.list({ is_active: true })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Route[] }).data ?? [];
        setRoutes(data.filter((r) => r.is_active));
      })
      .catch(() => setError('Gagal memuat rute'))
      .finally(() => setLoadingRoutes(false));
    FamilyAPI.list()
      .then((res) => { const d = Array.isArray(res.data) ? res.data : (res.data as { data?: FamilyMember[] }).data ?? []; setFamily(d); })
      .catch(() => {});
  }, []);

  const loadSchedules = useCallback(async (routeId: number) => {
    setLoadingSchedules(true);
    setSchedules([]);
    setSelectedSchedule(null);
    try {
      const res = await RoutesAPI.getSchedules(routeId);
      const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Schedule[] }).data ?? [];
      setSchedules(data.filter((s) => s.status === 'open' || s.is_active !== false));
    } catch {
      setError('Gagal memuat jadwal');
    } finally {
      setLoadingSchedules(false);
    }
  }, []);

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    loadSchedules(route.id);
  };

  const addPassenger = () => setPassengers((p) => [...p, emptyPassenger()]);
  const removePassenger = (idx: number) => setPassengers((p) => p.filter((_, i) => i !== idx));
  const updatePassenger = (idx: number, field: keyof Passenger, value: string) =>
    setPassengers((p) => p.map((pass, i) => i === idx ? { ...pass, [field]: value } : pass));

  const addFromFamily = (member: FamilyMember) => {
    const p: Passenger = {
      name: member.name, nik: member.nik, birth_date: member.birth_date,
      gender: member.gender, identity_type: member.identity_type,
      phone: member.phone ?? '', address: member.address ?? '',
    };
    setPassengers((prev) => [...prev, p]);
  };

  const validateStep = (s: number): string[] => {
    const errs: string[] = [];
    if (s === 1 && !selectedRoute) errs.push('Pilih rute terlebih dahulu');
    if (s === 2 && !selectedSchedule) errs.push('Pilih jadwal terlebih dahulu');
    if (s === 3) {
      passengers.forEach((p, i) => {
        if (!p.name.trim()) errs.push(`Penumpang ${i + 1}: nama lengkap wajib diisi`);
        if (!p.nik || p.nik.length !== 16) errs.push(`Penumpang ${i + 1}: NIK harus 16 digit`);
        if (!p.birth_date) errs.push(`Penumpang ${i + 1}: tanggal lahir wajib diisi`);
      });
    }
    if (s === 4) {
      passengers.forEach((p, i) => {
        if (!documents[i]) {
          errs.push(`Penumpang ${i + 1} (${p.name || 'Penumpang ' + (i + 1)}): foto/scan dokumen identitas wajib diunggah`);
        }
      });
    }
    return errs;
  };

  const next = () => {
    const errs = validateStep(step);
    if (errs.length > 0) { setStepErrors(errs); return; }
    setStepErrors([]);
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payloadPassengers = passengers.map((p) => {
        const anyP = p as unknown as Record<string, string>;
        const fullName = (p.name || anyP.full_name || '').trim();
        const address = (p.address || anyP.domicile_address || '').trim() || '-';
        return {
          full_name: fullName,
          name: fullName,
          nik: p.nik,
          birth_date: p.birth_date,
          gender: p.gender,
          identity_type: p.identity_type || 'KTP',
          phone: p.phone,
          domicile_address: address,
          address: address,
        };
      });

      const res = await RegistrationAPI.create({
        schedule_id: selectedSchedule!.id,
        passengers: payloadPassengers,
      });
      const regId = (res.data as { id?: number }).id ?? (res.data as { data?: { id: number } }).data?.id;

      // Upload documents
      if (regId) {
        const passRes = await RegistrationAPI.getById(regId);
        const regData = passRes.data as { passengers?: { id: number }[]; data?: { passengers?: { id: number }[] } };
        const savedPassengers = regData.passengers ?? regData.data?.passengers ?? [];
        for (let i = 0; i < savedPassengers.length; i++) {
          const file = documents[i];
          if (file && savedPassengers[i]?.id) {
            const fd = new FormData();
            fd.append('document', file);
            await RegistrationAPI.uploadDocument(regId, savedPassengers[i].id, fd);
          }
        }
        await RegistrationAPI.submit(regId);
        navigate(`/pendaftaran/${regId}`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pendaftaran Mudik Gratis</h1>
          <p className="text-slate-500 text-sm">Isi formulir pendaftaran sesuai langkah yang ditentukan</p>
        </div>

        <div className="mb-8">
          <Stepper steps={STEPS} currentStep={step} />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        {stepErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {stepErrors.map((e) => (
              <div key={e} className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />{e}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Pilih Rute */}
        {step === 1 && (
          <div className="card">
            <h2 className="font-bold text-slate-900 mb-4">Pilih Rute Tujuan</h2>
            {loadingRoutes ? <LoadingSpinner /> : (
              <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => handleSelectRoute(route)}
                    className={`p-4 rounded-xl border-2 text-left transition ${selectedRoute?.id === route.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'}`}
                  >
                    <div className="font-semibold text-sm text-slate-800">{route.name || route.route_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{route.origin} → {route.destination}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Pilih Jadwal */}
        {step === 2 && (
          <div className="card">
            <h2 className="font-bold text-slate-900 mb-1">Pilih Jadwal</h2>
            <p className="text-sm text-slate-500 mb-4">Rute: {selectedRoute?.route_name || selectedRoute?.name}</p>
            {loadingSchedules ? <LoadingSpinner /> : schedules.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Tidak ada jadwal tersedia untuk rute ini</div>
            ) : (
              <div className="space-y-3">
                {schedules.map((sch) => (
                  <button
                    key={sch.id}
                    onClick={() => setSelectedSchedule(sch)}
                    disabled={(sch.available_seats ?? 0) === 0}
                    className={`w-full p-4 rounded-xl border-2 text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${selectedSchedule?.id === sch.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-sm text-slate-800">
                          {new Date(sch.departure_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Jam {sch.departure_time} • {sch.departure_location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-semibold ${(sch.available_seats ?? 0) > 10 ? 'text-green-600' : (sch.available_seats ?? 0) > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {sch.available_seats ?? 0} kursi
                        </div>
                        <div className="text-xs text-slate-400">tersedia</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Penumpang */}
        {step === 3 && (
          <div className="space-y-4">
            {family.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-600" /> Tambah dari Anggota Keluarga
                </h3>
                <div className="flex flex-wrap gap-2">
                  {family.map((m) => (
                    <button key={m.id} onClick={() => addFromFamily(m)}
                      className="text-xs bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-full hover:bg-brand-100 transition">
                      + {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {passengers.map((p, idx) => (
              <div key={idx} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Penumpang {idx + 1}
                    {p.birth_date && <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{getAgeCategory(p.birth_date)}</span>}
                  </h3>
                  {idx > 0 && (
                    <button onClick={() => removePassenger(idx)} className="text-red-500 hover:text-red-700 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nama Lengkap" value={p.name} onChange={(e) => updatePassenger(idx, 'name', e.target.value)} placeholder="Sesuai KTP" required />
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Jenis Identitas <span className="text-red-500">*</span></label>
                    <select value={p.identity_type} onChange={(e) => updatePassenger(idx, 'identity_type', e.target.value)}
                      className="input-base">
                      <option value="KTP">KTP</option>
                      <option value="KK">Kartu Keluarga</option>
                      <option value="AKTA">Akta Kelahiran</option>
                      <option value="SIM">SIM</option>
                    </select>
                  </div>
                  <Input label="NIK (16 digit)" value={p.nik} onChange={(e) => updatePassenger(idx, 'nik', e.target.value)} placeholder="16 digit NIK" maxLength={16} required />
                  <Input label="Tanggal Lahir" type="date" value={p.birth_date} onChange={(e) => updatePassenger(idx, 'birth_date', e.target.value)} required />
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Jenis Kelamin <span className="text-red-500">*</span></label>
                    <select value={p.gender} onChange={(e) => updatePassenger(idx, 'gender', e.target.value as 'L' | 'P')}
                      className="input-base">
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <Input label="Nomor HP" type="tel" value={p.phone ?? ''} onChange={(e) => updatePassenger(idx, 'phone', e.target.value)} placeholder="08xxxxxxxxxx" />
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1">Alamat</label>
                    <textarea value={p.address ?? ''} onChange={(e) => updatePassenger(idx, 'address', e.target.value)}
                      className="input-base resize-none" rows={2} placeholder="Alamat lengkap" />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={addPassenger} className="w-full">
              <Plus className="w-4 h-4" /> Tambah Penumpang
            </Button>
          </div>
        )}

        {/* Step 4: Upload Dokumen */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-bold text-slate-900 mb-4">Upload Dokumen Penumpang</h2>
              <p className="text-sm text-slate-500 mb-4">Upload dokumen identitas untuk setiap penumpang (JPG, PNG, atau PDF, maks 2MB)</p>
              {passengers.map((p, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 mb-3">
                  <div className="font-semibold text-sm text-slate-800 mb-2">{p.name || `Penumpang ${idx + 1}`}</div>
                  <label className={`flex items-center gap-3 border-2 border-dashed rounded-lg p-4 cursor-pointer transition ${documents[idx] ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-brand-400'}`}>
                    <Upload className={`w-5 h-5 ${documents[idx] ? 'text-green-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {documents[idx] ? documents[idx]!.name : 'Klik untuk upload dokumen'}
                      </div>
                      <div className="text-xs text-slate-400">JPG, PNG, PDF — maks 2MB</div>
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setDocuments((prev) => ({ ...prev, [idx]: file }));
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Ringkasan */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-bold text-slate-900 mb-4">Ringkasan Pendaftaran</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Rute</span>
                  <span className="font-medium text-slate-900">{selectedRoute?.route_name || selectedRoute?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jadwal</span>
                  <span className="font-medium text-slate-900">
                    {selectedSchedule && new Date(selectedSchedule.departure_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jam Berangkat</span>
                  <span className="font-medium text-slate-900">{selectedSchedule?.departure_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lokasi Berangkat</span>
                  <span className="font-medium text-slate-900">{selectedSchedule?.departure_location}</span>
                </div>
                <hr className="border-slate-100" />
                <div>
                  <div className="text-slate-500 mb-2">Penumpang ({passengers.length} orang)</div>
                  {passengers.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <div>
                        <div className="font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.identity_type} • {getAgeCategory(p.birth_date)}</div>
                      </div>
                      <div className={`text-xs ${documents[idx] ? 'text-green-600' : 'text-yellow-600'}`}>
                        {documents[idx] ? '✓ Dokumen' : '⚠ Tanpa dokumen'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-700">
              Dengan menekan tombol <strong>Submit Pendaftaran</strong>, Anda menyatakan bahwa semua data yang diisi adalah benar dan sesuai.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button variant="secondary" onClick={back}>
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </Button>
          ) : <div />}
          {step < 5 ? (
            <Button onClick={next}>
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              Submit Pendaftaran
            </Button>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
