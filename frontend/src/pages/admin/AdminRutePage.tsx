import { useEffect, useState } from 'react';
import { RoutesAPI, AdminAPI } from '../../lib/api';
import type { Route } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminRutePage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    departure_date: '',
    departure_time: '08:00',
    departure_location: 'Terminal Batoh, Banda Aceh',
    capacity: 40,
  });

  const loadRoutes = () => {
    setLoading(true);
    RoutesAPI.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Route[] }).data ?? [];
        setRoutes(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRoutes(); }, []);

  const toggleRoute = async (route: Route) => {
    try {
      await AdminAPI.updateRoute(route.id, { is_active: !route.is_active });
      loadRoutes();
    } catch {
      /* ignore */
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;
    setSavingSchedule(true);
    try {
      await AdminAPI.createSchedule(selectedRoute.id, scheduleForm);
      setScheduleModal(false);
      setScheduleForm({ departure_date: '', departure_time: '08:00', departure_location: 'Terminal Batoh, Banda Aceh', capacity: 40 });
    } catch {
      /* ignore */
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Rute & Jadwal</h1>
        <p className="text-slate-500 text-sm mt-1">Daftar semua rute perjalanan Mudik Gratis Aceh 2026</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat rute..." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <div key={route.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="font-bold text-slate-900 text-sm">{route.route_name || route.name}</span>
                  </div>
                  <button
                    onClick={() => toggleRoute(route)}
                    className={`shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition ${
                      route.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {route.is_active ? (
                      <><CheckCircle2 className="w-3 h-3" /> Aktif</>
                    ) : (
                      <><XCircle className="w-3 h-3" /> Nonaktif</>
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-500 mb-4">
                  {route.origin} → {route.destination}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setSelectedRoute(route); setScheduleModal(true); }}
                  className="w-full text-xs"
                >
                  <Plus className="w-3 h-3" /> Tambah Jadwal
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Schedule Modal */}
      <Modal
        isOpen={scheduleModal}
        onClose={() => setScheduleModal(false)}
        title={`Tambah Jadwal: ${selectedRoute?.route_name || selectedRoute?.name}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setScheduleModal(false)} disabled={savingSchedule}>Batal</Button>
            <Button onClick={(e) => handleAddSchedule(e as unknown as React.FormEvent)} loading={savingSchedule}>Simpan Jadwal</Button>
          </>
        }
      >
        <form onSubmit={handleAddSchedule} className="space-y-4">
          <Input
            label="Tanggal Keberangkatan"
            type="date"
            value={scheduleForm.departure_date}
            onChange={(e) => setScheduleForm((p) => ({ ...p, departure_date: e.target.value }))}
            required
          />
          <Input
            label="Waktu Keberangkatan"
            type="time"
            value={scheduleForm.departure_time}
            onChange={(e) => setScheduleForm((p) => ({ ...p, departure_time: e.target.value }))}
            required
          />
          <Input
            label="Lokasi Keberangkatan"
            value={scheduleForm.departure_location}
            onChange={(e) => setScheduleForm((p) => ({ ...p, departure_location: e.target.value }))}
            placeholder="Contoh: Terminal Batoh, Banda Aceh"
            required
          />
          <Input
            label="Kapasitas Kursi"
            type="number"
            min={1}
            max={100}
            value={scheduleForm.capacity}
            onChange={(e) => setScheduleForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
            required
          />
        </form>
      </Modal>
    </AdminLayout>
  );
}
