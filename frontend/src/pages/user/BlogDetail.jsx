import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, Heart } from "lucide-react";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const API_URL =
  "http://localhost/telehealth/backend/api/UserPHP/blogPosts.php";

const viewedSlugSet = new Set();

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(false);
  const hasFetchedRef = useRef(false);

  const formatDate = (value) => {
    try {
      return new Date(value).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (err) {
      return null;
    }
  };

  const getInitials = (name = "TeleHealth+") => {
    const parts = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2);
    if (parts.length === 0) return "TH";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
    );
  };

  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, [slug]);

  useEffect(() => {
    hasFetchedRef.current = false;
  }, [slug]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const shouldTrackView = !viewedSlugSet.has(slug);
        let markedAsViewed = false;
        const params = new URLSearchParams({ slug });
        if (!shouldTrackView) {
          params.set("track_view", "0");
        } else {
          viewedSlugSet.add(slug);
          markedAsViewed = true;
        }

        const res = await fetch(`${API_URL}?${params.toString()}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "No se encontró el artículo");
        }

        setPost(data.post);

      } catch (err) {
        if (markedAsViewed) {
          viewedSlugSet.delete(slug);
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!slug || hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!post || liking) return;

    try {
      setLiking(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: post.slug ?? slug }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo registrar el like");
      }

      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: data.likes,
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLiking(false);
    }
  };

  return (
    <section
      className="min-h-screen bg-[var(--bg-main)] py-10"
      style={{ marginTop: "100px", fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white border border-[var(--navbar-dropdown-hover)] rounded-[28px] shadow-sm overflow-hidden">
          {!loading && !error && post?.cover_image_full_url && (
            <div className="relative">
              <img
                src={post.cover_image_full_url}
                alt={post.title}
                className="w-full h-[360px] object-cover"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-semibold uppercase text-[var(--navbar-text)] shadow-sm">
                  Blog
                </span>
              </div>
            </div>
          )}

          <div className="p-8 md:p-10 space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--navbar-text)] hover:underline"
              >
                <ArrowLeft size={18} />
                <span>Volver al blog</span>
              </Link>
              {!loading && !error && post?.published_at && (
                <span className="text-xs font-semibold text-[var(--text-sub)]">
                  {formatDate(post.published_at)}
                </span>
              )}
            </div>

            {loading && (
              <div className="text-center text-[var(--text-sub)] py-10">Cargando...</div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-5 rounded-2xl">
                {error}
              </div>
            )}

            {!loading && !error && post && (
              <article className="space-y-8">
                <div className="flex items-center gap-3">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-md bg-[var(--navbar-text)] text-white flex items-center justify-center hover:opacity-90 transition"
                    aria-label="Compartir en Facebook"
                  >
                    <FaFacebookF size={18} />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title ?? "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-md bg-[var(--navbar-text)] text-white flex items-center justify-center hover:opacity-90 transition"
                    aria-label="Compartir en Twitter"
                  >
                    <FaTwitter size={18} />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-md bg-[var(--navbar-text)] text-white flex items-center justify-center hover:opacity-90 transition"
                    aria-label="Compartir en LinkedIn"
                  >
                    <FaLinkedinIn size={18} />
                  </a>
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-[#088c9b] leading-tight">
                    {post.title}
                  </h1>
                  {post.excerpt && (
                    <p className="text-base md:text-lg text-[var(--navbar-link)] text-justify">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div
                  className="article-body space-y-6 text-[15px] md:text-[17px] leading-relaxed text-[var(--navbar-link)] [&>p]:mt-0 [&>p]:text-justify [&>p>strong]:text-[#26A1B5] [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-[#26A1B5] [&>h2]:mt-10 [&>h2]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:text-[var(--text-main)] [&>ul>li]:leading-relaxed [&>ul>li>strong]:text-[#26A1B5] [&>blockquote]:border-l-4 [&>blockquote]:border-[var(--navbar-text)] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[var(--text-main)]"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <footer className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--navbar-dropdown-hover)] text-sm text-[var(--text-sub)]">
                  <div className="flex items-center gap-4 text-[var(--text-main)]">
                    <span className="flex items-center gap-2">
                      <Eye size={16} strokeWidth={1.8} className="text-[var(--navbar-text)]" />
                      <span className="font-medium">{post.views ?? 0}</span>
                      vistas
                    </span>
                    <button
                      type="button"
                      onClick={handleLike}
                      disabled={liking}
                      className="flex items-center gap-2 text-[var(--navbar-text)] hover:opacity-80 transition disabled:opacity-60"
                    >
                      <Heart
                        size={16}
                        strokeWidth={1.8}
                        className="text-[var(--navbar-text)]"
                        fill={post.likes > 0 ? "currentColor" : "none"}
                      />
                      <span className="font-medium">{post.likes ?? 0}</span>
                      favoritos
                    </button>
                  </div>
                </footer>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
