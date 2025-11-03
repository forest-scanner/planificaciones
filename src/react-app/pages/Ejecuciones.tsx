import Layout from "@/react-app/components/Layout";
import { useState, useEffect } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, List, Upload } from "lucide-react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function EjecucionesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [distritos, setDistritos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [filterAsignado, setFilterAsignado] = useState("");
  const [formData, setFormData] = useState({
    id_programa: "",
    id_elemento: "",
    fecha_inicio: "",
    fecha_fin: "",
    periodicidad: "Única",
    repeticiones_max: "",
    estado: "Pendiente",
    asignado_a: "",
    notas: "",
    distrito_id: "",
  });
  const appUser = (user as any)?.app_user;
  const isAdmin = appUser?.is_admin === 1;

  useEffect(() => {
    fetchItems();
    fetchProgramas();
    fetchInventario();
    fetchDistritos();
    fetchUsuarios();
  }, []);

  const fetchItems = async () => {
    const response = await fetch("/api/ejecuciones");
    const data = await response.json();
    setItems(data);
  };

  const fetchProgramas = async () => {
    const response = await fetch("/api/programas");
    const data = await response.json();
    setProgramas(data);
  };

  const fetchInventario = async () => {
    const response = await fetch("/api/inventario");
    const data = await response.json();
    setInventario(data);
  };

  const fetchDistritos = async () => {
    const response = await fetch("/api/distritos");
    const data = await response.json();
    setDistritos(data);
  };

  const fetchUsuarios = async () => {
    const response = await fetch("/api/usuarios");
    const data = await response.json();
    setUsuarios(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingItem ? `/api/ejecuciones/${editingItem.id}` : "/api/ejecuciones";
    const method = editingItem ? "PUT" : "POST";

    const payload = {
      id_programa: parseInt(formData.id_programa),
      id_elemento: formData.id_elemento ? parseInt(formData.id_elemento) : undefined,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin || undefined,
      periodicidad: formData.periodicidad,
      repeticiones_max: formData.repeticiones_max ? parseInt(formData.repeticiones_max) : undefined,
      estado: formData.estado,
      asignado_a: formData.asignado_a || undefined,
      notas: formData.notas || undefined,
      distrito_id: formData.distrito_id ? parseInt(formData.distrito_id) : undefined,
      imagen_1_url: editingItem?.imagen_1_url,
      imagen_2_url: editingItem?.imagen_2_url,
    };

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setShowModal(false);
    setEditingItem(null);
    setFormData({
      id_programa: "",
      id_elemento: "",
      fecha_inicio: "",
      fecha_fin: "",
      periodicidad: "Única",
      repeticiones_max: "",
      estado: "Pendiente",
      asignado_a: "",
      notas: "",
      distrito_id: "",
    });
    fetchItems();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      id_programa: item.id_programa?.toString() || "",
      id_elemento: item.id_elemento?.toString() || "",
      fecha_inicio: item.fecha_inicio || "",
      fecha_fin: item.fecha_fin || "",
      periodicidad: item.periodicidad || "Única",
      repeticiones_max: item.repeticiones_max?.toString() || "",
      estado: item.estado || "Pendiente",
      asignado_a: item.asignado_a || "",
      notas: item.notas || "",
      distrito_id: item.distrito_id?.toString() || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar esta ejecución?")) {
      await fetch(`/api/ejecuciones/${id}`, { method: "DELETE" });
      fetchItems();
    }
  };

  const handleImageUpload = async (file: File, imageNumber: 1 | 2) => {
    // For now, just store as data URL (in production, upload to R2)
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (imageNumber === 1) {
        setEditingItem({ ...editingItem, imagen_1_url: dataUrl });
      } else {
        setEditingItem({ ...editingItem, imagen_2_url: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const calendarEvents = items.map((item) => ({
    id: item.id,
    title: `${item.nombre_programa} - ${item.estado}`,
    start: new Date(item.fecha_inicio),
    end: item.fecha_fin ? new Date(item.fecha_fin) : new Date(item.fecha_inicio),
    resource: item,
  }));

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Pendiente": return "bg-yellow-100 text-yellow-800";
      case "En Progreso": return "bg-blue-100 text-blue-800";
      case "Completada": return "bg-green-100 text-green-800";
      case "Completado-Informado Mint": return "bg-emerald-100 text-emerald-800";
      case "Cancelada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredItems = filterAsignado
    ? items.filter((item) => item.asignado_a === filterAsignado)
    : items;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Ejecuciones</h2>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <select
                value={filterAsignado}
                onChange={(e) => setFilterAsignado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Todos los usuarios</option>
                {usuarios.map((u) => (
                  <option key={u.email} value={u.email}>{u.nombre || u.email}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setViewMode(viewMode === "calendar" ? "list" : "calendar")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg"
            >
              {viewMode === "calendar" ? <List className="w-4 h-4" /> : <CalendarIcon className="w-4 h-4" />}
              {viewMode === "calendar" ? "Lista" : "Calendario"}
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  id_programa: "",
                  id_elemento: "",
                  fecha_inicio: "",
                  fecha_fin: "",
                  periodicidad: "Única",
                  repeticiones_max: "",
                  estado: "Pendiente",
                  asignado_a: isAdmin ? "" : appUser.email,
                  notas: "",
                  distrito_id: "",
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Nueva Ejecución
            </button>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 p-6" style={{ height: "600px" }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              culture="es"
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              defaultView={Views.MONTH}
              onSelectEvent={(event) => handleEdit(event.resource)}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.resource.estado === "Completada" || event.resource.estado === "Completado-Informado Mint" ? "#10b981" : 
                                   event.resource.estado === "En Progreso" ? "#3b82f6" :
                                   event.resource.estado === "Cancelada" ? "#ef4444" : "#eab308",
                },
              })}
            />
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Programa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actuación</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Elemento</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Fecha Inicio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Fecha Fin</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Asignado</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nombre_programa}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.nombre_actuacion}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.nombre_elemento || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.fecha_inicio}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.fecha_fin || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(item.estado)}`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.asignado_a || "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? "Editar Ejecución" : "Nueva Ejecución"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Programa *</label>
                  <select
                    value={formData.id_programa}
                    onChange={(e) => setFormData({ ...formData, id_programa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar programa</option>
                    {programas.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre_programa}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Elemento</label>
                  <select
                    value={formData.id_elemento}
                    onChange={(e) => setFormData({ ...formData, id_elemento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar elemento</option>
                    {inventario.map((i) => (
                      <option key={i.id} value={i.id}>{i.nombre_elemento}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Periodicidad</label>
                  <select
                    value={formData.periodicidad}
                    onChange={(e) => setFormData({ ...formData, periodicidad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="Única">Única</option>
                    <option value="Diaria">Diaria</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repeticiones Máx</label>
                  <input
                    type="number"
                    value={formData.repeticiones_max}
                    onChange={(e) => setFormData({ ...formData, repeticiones_max: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Completada">Completada</option>
                    <option value="Completado-Informado Mint">Completado-Informado Mint</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
                  <select
                    value={formData.asignado_a}
                    onChange={(e) => setFormData({ ...formData, asignado_a: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Sin asignar</option>
                    {usuarios.map((u) => (
                      <option key={u.email} value={u.email}>{u.nombre || u.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
                  <select
                    value={formData.distrito_id}
                    onChange={(e) => setFormData({ ...formData, distrito_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar distrito</option>
                    {distritos.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {editingItem && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Imágenes (máx. 2)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {editingItem.imagen_1_url ? (
                        <div className="relative">
                          <img src={editingItem.imagen_1_url} alt="Imagen 1" className="w-full h-32 object-cover rounded-xl" />
                          <button
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, imagen_1_url: null })}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Imagen 1</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 1)}
                          />
                        </label>
                      )}
                    </div>
                    <div>
                      {editingItem.imagen_2_url ? (
                        <div className="relative">
                          <img src={editingItem.imagen_2_url} alt="Imagen 2" className="w-full h-32 object-cover rounded-xl" />
                          <button
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, imagen_2_url: null })}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Imagen 2</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 2)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all"
                >
                  {editingItem ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
