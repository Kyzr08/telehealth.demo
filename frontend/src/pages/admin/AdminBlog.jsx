import { useEffect, useMemo, useState } from "react";
import { Plus, Edit3, Trash2, Eye, UploadCloud, X, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const API_URL = "http://localhost/telehealth/backend/api/AdminPHP/blogPosts.php";
const PUBLIC_POSTS_BASE = "http://localhost/telehealth/backend/public";

const initialForm = {
  id: null,
  title: "",
  excerpt: "",
  content: "",
  status: "draft",
};

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: "all", search: "" });
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState(initialForm);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const currentAuthorId = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("usuario");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id_usuario) return parsed.id_usuario;
      }
    } catch (err) {
      console.error("No se pudo leer usuario en sesión", err);
    }
    return null;
  }, []);

  const resetForm = () => {
    setFormValues(initialForm);
    setCoverPreview(null);
    setCoverFile(null);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "No se pudieron cargar las entradas");
      }

      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.search]);

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (post) => {
    setFormValues({
      id: post.id,
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      status: post.status || "draft",
    });
    setCoverPreview(post.cover_image_full_url || null);
    setCoverFile(null);
    setShowForm(true);
  };

  const handleFileChange = (evt) => {
    const file = evt.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverFile(null);
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!formValues.title.trim() || !formValues.content.trim()) {
      Swal.fire("Campos requeridos", "Título y contenido son obligatorios", "warning");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      if (formValues.id) payload.append("id", formValues.id);
      payload.append("title", formValues.title.trim());
      payload.append("excerpt", formValues.excerpt.trim());
      payload.append("content", formValues.content);
      payload.append("status", formValues.status);
      if (currentAuthorId) payload.append("author_id", currentAuthorId);
      if (coverFile) payload.append("cover_image", coverFile);

      const res = await fetch(API_URL, {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "No se pudo guardar la entrada");
      }

      Swal.fire(
        "Éxito",
        formValues.id ? "Entrada actualizada" : "Entrada creada",
        "success"
      );

      setShowForm(false);
      resetForm();
      fetchPosts();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Error al guardar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (postId, status) => {
    try {
      const res = await fetch(API_URL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, status }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "No se pudo actualizar el estado");
      }
      fetchPosts();
      Swal.fire("Estado actualizado", "La entrada cambió de estado", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "No se pudo actualizar el estado", "error");
    }
  };

  const handleDelete = async (postId) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar entrada?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "No se pudo eliminar la entrada");
      }
      Swal.fire("Eliminada", "La entrada fue eliminada", "success");
      fetchPosts();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "No se pudo eliminar", "error");
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      cover_image_full_url:
        post.cover_image_full_url ||
        (post.cover_image_url
          ? `${PUBLIC_POSTS_BASE}/${post.cover_image_url}`
          : null),
    }));
  }, [posts]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-[#1e293b]">Gestión del Blog</h2>
          <p className="text-sm text-[#64748b]">
            Crea, publica o archiva artículos para el blog de TeleHealth+.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-[#0aa6b7] text-white px-4 py-2 rounded-xl shadow hover:bg-[#08919d] transition"
        >
          <Plus size={18} />
          Nueva entrada
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 shadow-sm flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por título o contenido"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full outline-none text-sm"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm bg-white"
        >
          <option value="all">Todos los estados</option>
          <option value="draft">Borradores</option>
          <option value="published">Publicados</option>
          <option value="archived">Archivados</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-xs uppercase text-[#64748b]">
              <th className="px-4 py-3 text-left">Portada</th>
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Publicado</th>
              <th className="px-4 py-3 text-left">Vistas</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#64748b]">
                  Cargando artículos...
                </td>
              </tr>
            ) : filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#94a3b8]">
                  No hay artículos que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    {post.cover_image_full_url ? (
                      <img
                        src={post.cover_image_full_url}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-[#94a3b8] text-xs">
                        Sin imagen
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1e293b] line-clamp-2">
                      {post.title}
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">
                      {post.excerpt || "Sin resumen"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        post.status === "published"
                          ? "bg-green-50 text-green-600"
                          : post.status === "archived"
                          ? "bg-amber-50 text-amber-500"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {post.status === "draft"
                        ? "Borrador"
                        : post.status === "published"
                        ? "Publicado"
                        : "Archivado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#1e293b] font-semibold">
                    {post.views ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/blog/${post.slug || post.id}`}
                        className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100"
                        title="Ver en el sitio"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => openEditForm(post)}
                        className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-100"
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                      {post.status !== "published" && (
                        <button
                          onClick={() => updateStatus(post.id, "published")}
                          className="w-9 h-9 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center hover:bg-teal-100"
                          title="Publicar"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {post.status === "published" && (
                        <button
                          onClick={() => updateStatus(post.id, "archived")}
                          className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-100"
                          title="Archivar"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#1e293b]"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold text-[#1e293b] mb-1">
              {formValues.id ? "Editar entrada" : "Nueva entrada"}
            </h3>
            <p className="text-sm text-[#64748b] mb-6">
              Completa la información del artículo. Al publicar se mostrará en el blog.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formValues.title}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0aa6b7] outline-none"
                  placeholder="Título atractivo para el artículo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  Resumen o extracto (opcional)
                </label>
                <textarea
                  value={formValues.excerpt}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0aa6b7] outline-none"
                  placeholder="Una introducción breve que aparecerá en la tarjeta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  Contenido (admite HTML básico)
                </label>
                <textarea
                  value={formValues.content}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={10}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0aa6b7] outline-none"
                  placeholder="Ingresa el contenido. Puedes usar etiquetas HTML simples como <p>, <h2>, <ul>"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-1">
                    Estado
                  </label>
                  <select
                    value={formValues.status}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0aa6b7] outline-none"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-1">
                    Imagen de portada
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#0aa6b7]/40 rounded-xl px-4 py-6 text-sm text-[#0aa6b7] cursor-pointer hover:border-[#0aa6b7] transition">
                    <UploadCloud size={20} className="mb-1" />
                    <span>Haz clic para cargar</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Previsualización"
                      className="mt-3 h-40 w-full object-cover rounded-xl border border-gray-100"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-[#475569] hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#0aa6b7] text-white font-semibold shadow hover:bg-[#08919d] disabled:opacity-70"
                >
                  {submitting ? "Guardando..." : formValues.id ? "Actualizar" : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
