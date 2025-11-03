import Layout from "@/react-app/components/Layout";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Actuacion, Distrito } from "@/shared/types";

export default function ActuacionesPage() {
  const [items, setItems] = useState<Actuacion[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Actuacion | null>(null);
  const [formData, setFormData] = useState({
    nombre_actuacion: "",
    distrito_id: "",
  });

  useEffect(() => {
    fetchItems();
    fetchDistritos();
  }, []);

  const fetchItems = async () => {
    const response = await fetch("/api/actuaciones");
    const data = await response.json();
    setItems(data);
  };

  const fetchDistritos = async () => {
    const response = await fetch("/api/distritos");
    const data = await response.json();
    setDistritos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingItem ? `/api/actuaciones/${editingItem.id}` : "/api/actuaciones";
    const method = editingItem ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        distrito_id: formData.distrito_id ? parseInt(formData.distrito_id) : undefined,
      }),
    });

    setShowModal(false);
    setEditingItem(null);
    setFormData({ nombre_actuacion: "", distrito_id: "" });
    fetchItems();
  };

  const handleEdit = (item: Actuacion) => {
    setEditingItem(item);
    setFormData({
      nombre_actuacion: item.nombre_actuacion,
      distrito_id: item.distrito_id?.toString() || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar esta actuación?")) {
      await fetch(`/api/actuaciones/${id}`, { method: "DELETE" });
      fetchItems();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Actuaciones</h2>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({ nombre_actuacion: "", distrito_id: "" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Nueva Actuación
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Distrito</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nombre_actuacion}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{(item as any).distrito_nombre || "-"}</td>
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? "Editar Actuación" : "Nueva Actuación"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre_actuacion}
                  onChange={(e) => setFormData({ ...formData, nombre_actuacion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
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
