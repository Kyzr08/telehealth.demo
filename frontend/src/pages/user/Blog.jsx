import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  "http://localhost/telehealth/backend/api/UserPHP/blogPosts.php";
const POSTS_PER_PAGE = 9;

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: POSTS_PER_PAGE.toString(),
        });

        const res = await fetch(`${API_URL}?${params.toString()}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "No se pudieron cargar los artículos");
        }

        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setMeta(data.meta || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const totalPages = meta?.total_pages ?? 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <section className="min-h-screen bg-[#f0fafd] px-4 py-0 flex flex-col">
      {/* Header */}
      <div
        className="w-full bg-[#e6f8fb] py-12 mb-10"
        style={{ marginTop: "110px" }}
      >
        <div className="max-w-6xl mx-auto text-center px-4">
          <p className="text-[#0aa6b7] font-semibold tracking-widest uppercase mb-2 text-sm">
            Blog TeleHealth+
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-3">
            Innovación y bienestar digital
          </h1>
          <p className="text-[#64748b] text-lg">
            Noticias, avances y consejos sobre telemedicina, salud digital e inteligencia artificial.
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: POSTS_PER_PAGE }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="bg-white rounded-xl shadow animate-pulse h-72"
                  >
                    <div className="h-40 w-full bg-gray-200" />
                    <div className="p-5 flex-1 flex items-end">
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))
              : posts.map((post) => (
                  <Link
                    key={post.id ?? post.slug}
                    to={`/blog/${post.slug || post.id}`}
                    className="bg-white rounded-[20px] shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col"
                  >
                    <div className="h-48 w-full bg-gray-100">
                      <img
                        src={post.cover_image_full_url || "/img/teleconsulta.jpg"}
                        alt={post.title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold leading-snug text-[#088c9b]">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
          </div>

          {!loading && posts.length === 0 && !error && (
            <div className="bg-white rounded-xl shadow p-10 text-center text-[#64748b] mt-6">
              Aún no hay artículos publicados. ¡Vuelve pronto!
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="max-w-6xl mx-auto flex justify-center mt-10 mb-20">
        <nav className="flex items-center space-x-1 text-[#1e293b] text-base select-none">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded hover:bg-[#e6f8fb] transition ${
              currentPage === 1 ? "text-gray-400 cursor-not-allowed" : ""
            }`}
          >
            &laquo; Anterior
          </button>
          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => handlePageChange(num)}
              className={`px-3 py-1 rounded font-semibold ${
                currentPage === num
                  ? "bg-[#0aa6b7] text-white"
                  : "hover:bg-[#e6f8fb] transition"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-2 py-1 rounded hover:bg-[#e6f8fb] transition ${
              currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : ""
            }`}
          >
            Siguiente &raquo;
          </button>
        </nav>
      </div>

      {/* Espacio para footer */}
      <div className="h-16 md:h-24" />
    </section>
  );
}
