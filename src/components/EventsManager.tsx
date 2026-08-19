import React, { useState, useEffect } from "react";
import { IKContext, IKUpload } from "imagekitio-react";
import { supabase } from "../lib/supabase";
import { Plus, X, Upload, CheckCircle, Clock, Trash2, Link as LinkIcon, Edit2 } from "lucide-react";

export interface EventItem {
  id: string;
  title: string;
  category?: string;
  date?: string;
  description?: string;
  image_url?: string;
  status?: string;
  registration_link?: string;
  stage: "upcoming" | "completed";
  year?: string;
  link?: string;
}

const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

const authenticator = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch("/api/imagekit/auth", {
      headers: {
        "Authorization": `Bearer ${session?.access_token || ""}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

export default function EventsManager() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<EventItem>>({
    stage: "upcoming",
    status: "Upcoming",
    registration_link: "https://eventhubcc.vit.ac.in/EventHub/"
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (e) {
      console.error("Failed to fetch events", e);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = await getHeaders();
    
    try {
      if (editingId) {
        await fetch(`/api/events/${editingId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(formData)
        });
      } else {
        await fetch("/api/events", {
          method: "POST",
          headers,
          body: JSON.stringify(formData)
        });
      }
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    const headers = await getHeaders();
    try {
      await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers
      });
      fetchEvents();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleMoveToCompleted = async (event: EventItem) => {
    const headers = await getHeaders();
    try {
      await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ ...event, stage: "completed" })
      });
      fetchEvents();
    } catch (e) {
      console.error("Move failed", e);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ stage: "upcoming", status: "Upcoming", registration_link: "https://eventhubcc.vit.ac.in/EventHub/" });
  };

  const openEdit = (evt: EventItem) => {
    setEditingId(evt.id);
    setFormData(evt);
    setShowModal(true);
  };

  const onError = (err: any) => {
    console.error("Image Upload Error:", err);
    setUploadingImage(false);
    alert("Image upload failed. Ensure you are an Admin.");
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
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
        <div>
          <h2 className="font-sans text-lg font-bold text-white">Events Dashboard</h2>
          <p className="font-mono text-[10px] text-zinc-500 mt-1">Manage Upcoming and Mission Archive Events.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#e8b828] text-black font-semibold rounded hover:bg-yellow-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="p-6 overflow-y-auto">
        {loading ? (
          <div className="text-zinc-500 text-sm font-mono text-center py-10 animate-pulse">Loading Database Tables...</div>
        ) : events.length === 0 ? (
          <div className="text-zinc-500 text-sm font-mono text-center py-10">No events found in database.</div>
        ) : (
          <div className="space-y-8">
            {/* UPCOMING EVENTS */}
            <div>
              <h3 className="text-[#e8b828] font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Upcoming Events
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.filter(e => e.stage === "upcoming").map(evt => (
                  <div key={evt.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 group flex flex-col relative overflow-hidden">
                    {evt.image_url && (
                      <div className="w-full h-32 mb-4 rounded bg-zinc-800 overflow-hidden">
                        <img src={evt.image_url} alt={evt.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <h4 className="text-white font-bold text-lg leading-tight mb-1">{evt.title}</h4>
                    <p className="text-xs text-zinc-400 font-mono mb-4">{evt.date}</p>
                    
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-800/50">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(evt)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(evt.id)} className="p-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <button onClick={() => handleMoveToCompleted(evt)} className="text-xs text-[#e8b828] hover:text-white transition-colors border border-[#e8b828]/30 px-3 py-1.5 rounded bg-[#e8b828]/10 hover:bg-[#e8b828]/30">
                        Mark Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPLETED EVENTS */}
            <div>
              <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Mission Archive (Completed)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.filter(e => e.stage === "completed").map(evt => (
                  <div key={evt.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 flex flex-col relative opacity-80 hover:opacity-100 transition-opacity">
                    <h4 className="text-white font-bold text-lg leading-tight mb-1">{evt.title}</h4>
                    <p className="text-xs text-zinc-400 font-mono mb-4">{evt.year} - {evt.category}</p>
                    
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-800/50">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(evt)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(evt.id)} className="p-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{editingId ? "Edit Event" : "Create New Event"}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-mono text-zinc-500 mb-1">Event Title</label>
                    <input required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 mb-1">Stage</label>
                    <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as any})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors">
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed (Archive)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 mb-1">Date String (e.g. 14.09.26)</label>
                    <input value={formData.date || ""} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors" />
                  </div>

                  {formData.stage === "completed" && (
                    <>
                      <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1">Archive Year (e.g. 26')</label>
                        <input value={formData.year || ""} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1">Archive Category</label>
                        <input value={formData.category || ""} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-mono text-zinc-500 mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> External Link (e.g. Google Photos)</label>
                        <input value={formData.link || ""} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors" />
                      </div>
                    </>
                  )}

                  {formData.stage === "upcoming" && (
                    <>
                      <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1">Status Badge (e.g. Upcoming)</label>
                        <input value={formData.status || ""} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1">Registration URL</label>
                        <input value={formData.registration_link || ""} onChange={e => setFormData({...formData, registration_link: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors" />
                      </div>
                    </>
                  )}

                  <div className="col-span-2">
                    <label className="block text-xs font-mono text-zinc-500 mb-1">Description</label>
                    <textarea rows={3} value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#e8b828] transition-colors" />
                  </div>

                  <div className="col-span-2 border border-zinc-800 bg-zinc-900/50 p-4 rounded flex flex-col items-center justify-center">
                    {formData.image_url ? (
                      <div className="relative w-full h-40 bg-black rounded overflow-hidden flex justify-center items-center">
                        <img src={formData.image_url} alt="Preview" className="h-full object-contain" />
                        <button type="button" onClick={() => setFormData({...formData, image_url: ""})} className="absolute top-2 right-2 p-1 bg-red-900/80 text-white rounded"><X className="w-4 h-4"/></button>
                      </div>
                    ) : (
                      <div className="text-center w-full">
                        <IKContext publicKey={publicKey} urlEndpoint={urlEndpoint} authenticator={authenticator}>
                          <label className={`w-full flex flex-col items-center justify-center py-6 border-2 border-dashed ${uploadingImage ? 'border-[#e8b828] bg-[#e8b828]/10' : 'border-zinc-700 hover:border-[#e8b828]'} rounded cursor-pointer transition-colors`}>
                            <Upload className={`w-8 h-8 mb-2 ${uploadingImage ? 'text-[#e8b828] animate-bounce' : 'text-zinc-500'}`} />
                            <span className="text-zinc-400 font-mono text-xs">{uploadingImage ? "Uploading to ImageKit..." : "Click to Upload Cover Image"}</span>
                            <IKUpload
                              fileName={`event_cover_${Date.now()}.jpg`}
                              tags={["event"]}
                              onError={onError}
                              onSuccess={onSuccess}
                              onUploadStart={onUploadStart}
                              className="hidden"
                            />
                          </label>
                        </IKContext>
                      </div>
                    )}
                  </div>

                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/30">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded text-zinc-400 hover:text-white font-semibold transition-colors">Cancel</button>
              <button form="event-form" type="submit" disabled={uploadingImage} className="px-6 py-2 rounded bg-[#e8b828] hover:bg-yellow-400 text-black font-bold transition-colors disabled:opacity-50">
                {editingId ? "Save Changes" : "Publish Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
