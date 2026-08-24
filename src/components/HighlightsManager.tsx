import React, { useState, useEffect } from "react";
import { IKContext, IKUpload } from "imagekitio-react";
import { supabase } from "../lib/supabase";
import { 
  Plus, 
  X, 
  Upload, 
  Sparkles, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Layers, 
  Eye, 
  Microscope,
  CheckCircle2
} from "lucide-react";
import { GALLERY_ITEMS } from "../data";

export interface HighlightItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  image_url: string;
  image?: string;
  story?: string;
  description?: string;
  year?: string;
  order_index?: number;
  created_at?: string;
}

const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || "public_71JnHSaqVAHxxKa9BoAMqaJcvvY=";
const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/Rifan";

const authenticator = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    
    // Try /api/imagekit/auth first
    let response = await fetch("/api/imagekit/auth", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok && response.status === 404) {
      response = await fetch("/imagekit/auth", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      let parsedMsg = errorText;
      try {
        const jsonErr = JSON.parse(errorText);
        parsedMsg = jsonErr.error || errorText;
      } catch {}
      throw new Error(`Authentication failed (${response.status}): ${parsedMsg}`);
    }
    
    const data = await response.json();
    const { signature, expire, token: ikToken } = data;
    return { signature, expire, token: ikToken };
  } catch (error: any) {
    console.error("ImageKit Auth Error:", error);
    throw new Error(error.message || "Failed to authenticate ImageKit upload.");
  }
};

export const sampleGalleryPresets = [
  { name: "Technical Seminar", url: "/gallery/1.jpg" },
  { name: "Chassis Rig", url: "/gallery/2.jpg" },
  { name: "Rover Collaboration", url: "/gallery/3.jpg" },
  { name: "Robotic Arm", url: "/gallery/4.jpg" },
  { name: "Keynote Lecture", url: "/gallery/5.jpg" },
  { name: "Symposium Showcase", url: "/gallery/6.jpg" },
  { name: "Circuit Soldering", url: "/gallery/7.jpg" },
  { name: "Drone Aerodynamics", url: "/gallery/8.jpg" },
  { name: "Neural Networks", url: "/gallery/9.jpg" },
  { name: "Final Integration", url: "/gallery/10.jpg" }
];

export default function HighlightsManager() {
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<HighlightItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HighlightItem>>({
    title: "",
    subtitle: "",
    category: "R&D",
    image_url: "",
    story: "",
    order_index: 1
  });

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      // 1. Direct Supabase query
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        setHighlights(data.map(item => ({
          ...item,
          id: String(item.id),
          subtitle: item.subtitle || item.category,
          story: item.story || item.description
        })));
        setLoading(false);
        return;
      }

      // 2. Fallback: Backend API endpoint
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const apiData = await res.json();
        if (Array.isArray(apiData) && apiData.length > 0) {
          setHighlights(apiData.map(item => ({
            ...item,
            id: String(item.id),
            subtitle: item.subtitle || item.category,
            story: item.story || item.description
          })));
          setLoading(false);
          return;
        }
      }

      // 3. Fallback to static gallery data if DB is empty
      const defaultItems: HighlightItem[] = GALLERY_ITEMS.map((item, idx) => ({
        id: String(item.id),
        title: item.title,
        subtitle: item.subtitle,
        category: item.subtitle,
        image_url: item.image,
        image: item.image,
        story: item.story,
        description: item.story,
        order_index: idx + 1
      }));
      setHighlights(defaultItems);
    } catch (e) {
      console.error("Failed to fetch highlights", e);
      // Fallback
      setHighlights(GALLERY_ITEMS.map((item, idx) => ({
        id: String(item.id),
        title: item.title,
        subtitle: item.subtitle,
        category: item.subtitle,
        image_url: item.image,
        story: item.story,
        order_index: idx + 1
      })));
    } finally {
      setLoading(false);
    }
  };

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.access_token || ""}`
    };
  };

  const isValidUUID = (val?: string | number | null) => {
    if (!val) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = await getHeaders();

    // Map to guaranteed existing database columns (category and description)
    const cleanPayload = {
      title: formData.title || "Untitled Highlight",
      category: formData.subtitle || formData.category || "Operations",
      image_url: formData.image_url || "/gallery/1.jpg",
      description: formData.story || formData.description || "",
      order_index: typeof formData.order_index === "number" ? formData.order_index : 1,
      year: formData.year || "2025"
    };

    const isEditUUID = editingId && isValidUUID(editingId);

    try {
      if (isEditUUID) {
        // 1. Try Backend API first
        let apiSuccess = false;
        try {
          const res = await fetch(`/api/gallery/${editingId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(cleanPayload)
          });
          if (res.ok) apiSuccess = true;
        } catch (apiErr) {
          console.warn("API update error, falling back to direct Supabase:", apiErr);
        }

        if (!apiSuccess) {
          const { error: sbError } = await supabase
            .from("gallery")
            .update(cleanPayload)
            .eq("id", editingId);

          if (sbError) throw new Error(sbError.message || "Failed to update highlight in database");
        }
      } else {
        // Create new record (also handles editing a non-UUID default preset)
        let apiSuccess = false;
        try {
          const res = await fetch("/api/gallery", {
            method: "POST",
            headers,
            body: JSON.stringify(cleanPayload)
          });
          if (res.ok) apiSuccess = true;
        } catch (apiErr) {
          console.warn("API insert error, falling back to direct Supabase:", apiErr);
        }

        if (!apiSuccess) {
          const { error: sbError } = await supabase
            .from("gallery")
            .insert([cleanPayload]);

          if (sbError) throw new Error(sbError.message || "Failed to create highlight in database");
        }
      }

      setShowModal(false);
      resetForm();
      await fetchHighlights();
    } catch (e: any) {
      console.error("Save highlight failed", e);
      alert(e.message || "Failed to save highlight item. Ensure you have administrator clearance.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this highlight photo from Operations Recap?")) return;
    
    // If it's a local preset card without a UUID in database, just clear it locally
    if (!isValidUUID(id)) {
      setHighlights(prev => prev.filter(h => h.id !== id));
      return;
    }

    const headers = await getHeaders();
    try {
      let apiSuccess = false;
      try {
        const res = await fetch(`/api/gallery/${id}`, {
          method: "DELETE",
          headers
        });
        if (res.ok) apiSuccess = true;
      } catch (apiErr) {
        console.warn("API delete error, falling back to direct Supabase:", apiErr);
      }

      if (!apiSuccess) {
        const { error: sbError } = await supabase
          .from("gallery")
          .delete()
          .eq("id", id);

        if (sbError) throw new Error(sbError.message || "Failed to delete highlight from database");
      }
      await fetchHighlights();
    } catch (e: any) {
      console.error("Delete failed", e);
      alert(e.message || "Failed to delete highlight.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      subtitle: "",
      category: "Operations",
      image_url: "",
      story: "",
      order_index: highlights.length + 1
    });
    setUploadMode("upload");
  };

  const openEdit = (item: HighlightItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      subtitle: item.subtitle || item.category,
      category: item.category || item.subtitle,
      image_url: item.image_url || item.image,
      story: item.story || item.description,
      order_index: item.order_index ?? 1
    });
    setShowModal(true);
  };

  const onError = (err: any) => {
    console.error("Image Upload Error:", err);
    setUploadingImage(false);
    alert(`Image upload error: ${err.message || "Upload failed. You can also paste an image URL or choose a preset in the 'URL / Presets' tab."}`);
  };

  const onSuccess = (res: any) => {
    console.log("Image Upload Success:", res);
    setFormData(prev => ({ ...prev, image_url: res.url }));
    setUploadingImage(false);
  };

  const onUploadStart = () => {
    setUploadingImage(true);
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col min-h-[500px]">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e8b828]" />
            <h2 className="font-sans text-lg font-bold text-white">Operations Highlights Dashboard</h2>
          </div>
          <p className="font-mono text-[10px] text-zinc-500 mt-1">
            Manage the Operations Recap Highlights Gallery slider and interactive Project Details modal.
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#e8b828] text-black font-semibold rounded hover:bg-yellow-400 transition-colors cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Highlight
        </button>
      </div>

      {/* Main Content Body */}
      <div className="p-6 overflow-y-auto">
        {loading ? (
          <div className="text-zinc-500 text-sm font-mono text-center py-12 animate-pulse">
            Loading Operations Gallery Records...
          </div>
        ) : highlights.length === 0 ? (
          <div className="text-zinc-500 text-sm font-mono text-center py-12">
            No highlight slides found. Click "Add Highlight" to create the first slide.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#e8b828] uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> Active Gallery Slides ({highlights.length})
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                Sorted by Display Order
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {highlights.map((item, idx) => (
                <div 
                  key={item.id || idx} 
                  className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden flex flex-col group hover:border-zinc-700 transition-all duration-300 relative"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative w-full h-44 bg-zinc-950 overflow-hidden">
                    <img 
                      src={item.image_url || item.image || "/gallery/1.jpg"} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
                    
                    {/* Subtitle / Domain Badge */}
                    <div className="absolute top-3 left-3 bg-zinc-950/90 backdrop-blur-md px-2.5 py-1 rounded border border-zinc-800 text-[10px] font-mono text-[#e8b828] uppercase font-bold tracking-wider">
                      {item.subtitle || item.category || "Highlight"}
                    </div>

                    {/* Order Index Badge */}
                    <div className="absolute top-3 right-3 bg-zinc-900/90 text-zinc-400 font-mono text-[10px] px-2 py-0.5 rounded border border-zinc-800">
                      #{item.order_index ?? idx + 1}
                    </div>
                  </div>

                  {/* Title & Details Narrative */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-white font-bold text-base leading-tight mb-2 group-hover:text-[#e8b828] transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-zinc-400 font-sans line-clamp-3 leading-relaxed mb-4 flex-grow">
                      {item.story || item.description || "No mission log narrative entered."}
                    </p>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-auto">
                      <button 
                        onClick={() => setPreviewItem(item)}
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 px-2.5 py-1.5 rounded transition-colors cursor-pointer font-mono"
                        title="Preview Project Details Modal"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#e8b828]" />
                        <span>Preview</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => openEdit(item)}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors cursor-pointer"
                          title="Edit Highlight"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 bg-red-950/40 hover:bg-red-900/80 text-red-400 rounded transition-colors cursor-pointer border border-red-900/30"
                          title="Delete Highlight"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#e8b828]" />
                <h3 className="text-xl font-bold text-white">
                  {editingId ? "Edit Highlight Slide" : "Add Operations Highlight"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="highlight-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-zinc-400 mb-1">
                      Highlight Title <span className="text-[#e8b828]">*</span>
                    </label>
                    <input 
                      required 
                      value={formData.title || ""} 
                      onChange={e => setFormData({ ...formData, title: e.target.value })} 
                      placeholder="e.g. Technical Seminar, Chassis Optimization Test" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors text-sm" 
                    />
                  </div>

                  {/* Subtitle / Track */}
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">
                      Subtitle / Track Badge <span className="text-[#e8b828]">*</span>
                    </label>
                    <input 
                      required
                      value={formData.subtitle || ""} 
                      onChange={e => setFormData({ ...formData, subtitle: e.target.value })} 
                      placeholder="e.g. Embedded Systems, R&D Lab, Aerodynamics" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors text-sm" 
                    />
                  </div>

                  {/* Order Index */}
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">
                      Display Order Index
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.order_index ?? 1} 
                      onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })} 
                      placeholder="1" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors text-sm" 
                    />
                  </div>

                  {/* Project Details Narrative (Story) */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-zinc-400 mb-1">
                      Project Details / Mission Log Story <span className="text-[#e8b828]">*</span>
                      <span className="text-zinc-500 text-[10px] ml-2">(Displayed when visitor clicks "View Project Details")</span>
                    </label>
                    <textarea 
                      required
                      rows={4} 
                      value={formData.story || ""} 
                      onChange={e => setFormData({ ...formData, story: e.target.value })} 
                      placeholder="Describe what occurred, engineering methods used, systems integrated, challenges overcome..." 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors text-sm leading-relaxed" 
                    />
                  </div>

                  {/* Image Section with ImageKit Upload & Preset URL Selector */}
                  <div className="md:col-span-2 border border-zinc-800 bg-zinc-900/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
                      <label className="text-xs font-mono text-zinc-300 font-semibold flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#e8b828]" /> Highlight Photograph
                      </label>
                      <div className="flex gap-2 text-xs">
                        <button 
                          type="button" 
                          onClick={() => setUploadMode("upload")}
                          className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-mono ${uploadMode === "upload" ? "bg-[#e8b828] text-black font-semibold" : "text-zinc-400 hover:text-white"}`}
                        >
                          ImageKit Upload
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setUploadMode("url")}
                          className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-mono ${uploadMode === "url" ? "bg-[#e8b828] text-black font-semibold" : "text-zinc-400 hover:text-white"}`}
                        >
                          URL / Presets
                        </button>
                      </div>
                    </div>

                    {formData.image_url ? (
                      <div className="relative w-full h-48 bg-zinc-950 rounded-lg overflow-hidden flex justify-center items-center border border-zinc-800">
                        <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setFormData({ ...formData, image_url: "" })} 
                          className="absolute top-2 right-2 p-1.5 bg-red-900/90 hover:bg-red-800 text-white rounded cursor-pointer transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : uploadMode === "upload" ? (
                      <div className="text-center w-full">
                        <IKContext publicKey={publicKey} urlEndpoint={urlEndpoint} authenticator={authenticator}>
                          <label className={`w-full flex flex-col items-center justify-center py-8 border-2 border-dashed ${uploadingImage ? 'border-[#e8b828] bg-[#e8b828]/10' : 'border-zinc-700 hover:border-[#e8b828]'} rounded-lg cursor-pointer transition-colors`}>
                            <Upload className={`w-8 h-8 mb-2 ${uploadingImage ? 'text-[#e8b828] animate-bounce' : 'text-zinc-500'}`} />
                            <span className="text-zinc-300 font-mono text-xs">
                              {uploadingImage ? "Uploading directly to ImageKit CDN..." : "Click to Upload Photo to ImageKit"}
                            </span>
                            <span className="text-zinc-500 text-[11px] mt-1 font-sans">
                              Supports JPG, PNG, WebP up to 10MB
                            </span>
                            <IKUpload
                              fileName={`highlight_${Date.now()}.jpg`}
                              tags={["highlight", "gallery"]}
                              folder="/robotics-club/gallery"
                              onError={onError}
                              onSuccess={onSuccess}
                              onUploadStart={onUploadStart}
                              className="hidden"
                            />
                          </label>
                        </IKContext>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <input 
                            type="text" 
                            placeholder="Paste CDN/Image URL (e.g. https://... or /gallery/1.jpg)" 
                            value={formData.image_url || ""} 
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white text-xs outline-none focus:border-[#e8b828]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-mono text-zinc-500">Quick Select Local Presets:</span>
                          <div className="flex flex-wrap gap-2">
                            {sampleGalleryPresets.map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setFormData({ ...formData, image_url: preset.url })}
                                className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] text-zinc-300 hover:text-[#e8b828] transition-colors cursor-pointer"
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/30">
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 rounded text-zinc-400 hover:text-white font-semibold transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button 
                form="highlight-form" 
                type="submit" 
                disabled={uploadingImage} 
                className="px-6 py-2 rounded bg-[#e8b828] hover:bg-yellow-400 text-black font-bold transition-colors disabled:opacity-50 cursor-pointer text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingId ? "Save Changes" : "Publish Highlight"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal (Simulates the "View Project Details" dialog) */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]">
            <div className="h-1 bg-[#e8b828] w-full" />
            
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-left">
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-full transition-colors cursor-pointer z-50"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full h-[250px] sm:h-[300px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center">
                <img 
                  src={previewItem.image_url || previewItem.image || "/gallery/1.jpg"} 
                  alt={previewItem.title} 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none opacity-80" />
                
                <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-zinc-800 text-[10px] font-mono text-[#e8b828] uppercase font-bold tracking-wider z-20">
                  {previewItem.subtitle || previewItem.category}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">{previewItem.title}</h2>
                
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5">
                  <span className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 pb-3 border-b border-zinc-800">
                    <Microscope className="w-3.5 h-3.5 text-[#e8b828]" />
                    MISSION LOG FILE // LIVE ADMIN PREVIEW
                  </span>
                  <p className="text-zinc-300 text-sm leading-relaxed font-sans">
                    {previewItem.story || previewItem.description || "No log description provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 px-6 py-4 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5 text-[#e8b828]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PREVIEWING LIVE FRONTEND MODAL
              </span>
              <button 
                onClick={() => setPreviewItem(null)} 
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
