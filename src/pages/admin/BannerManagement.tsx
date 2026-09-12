import React, { useState, FormEvent } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  XCircle, 
  Image as ImageIcon, 
  ExternalLink, 
  X, 
  RefreshCw, 
  Layers, 
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import { Banner } from "../adminTypes";
import { adminApi } from "../adminApi";

interface BannerManagementProps {
  banners: Banner[];
  onBannersChange: (banners: Banner[]) => void;
  onFlashSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  isSuperAdmin: boolean;
}

const PRESET_BANNER_IMAGES = [
  {
    name: "Luxury Atelier",
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=75&fm=webp",
  },
  {
    name: "Express Courier",
    url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=75&fm=webp",
  },
  {
    name: "Wholesale Procurement",
    url: "https://images.unsplash.com/photo-1580907115718-4c8abd021ae5?w=1200&auto=format&fit=crop&q=75&fm=webp",
  },
  {
    name: "Haute Couture Lookbook",
    url: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&auto=format&fit=crop&q=75&fm=webp",
  },
  {
    name: "Swiss Chronograph",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=75&fm=webp",
  },
  {
    name: "High-End Audio",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=75&fm=webp",
  },
];

export default function BannerManagement({
  banners,
  onBannersChange,
  onFlashSuccess,
  onError,
  isSuperAdmin,
}: BannerManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    link: "category_search",
    order: 1,
    active: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const activeCount = banners.filter((b) => b.active).length;
  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);

  function openCreateModal() {
    const nextOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.order || 0)) + 1 : 1;
    setEditingBanner(null);
    setFormData({
      imageUrl: "",
      title: "",
      subtitle: "",
      description: "",
      buttonText: "Shop Now",
      link: "category_search",
      order: nextOrder,
      active: true,
    });
    setModalOpen(true);
  }

  function openEditModal(banner: Banner) {
    setEditingBanner(banner);
    setFormData({
      imageUrl: banner.imageUrl || "",
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      buttonText: banner.buttonText || "",
      link: banner.link || "category_search",
      order: banner.order || 1,
      active: banner.active !== false,
    });
    setModalOpen(true);
  }

  async function handleToggleActive(banner: Banner) {
    try {
      const updated = await adminApi.toggleBanner(banner._id);
      const newBanners = banners.map((b) =>
        b._id === banner._id ? { ...b, active: updated.active } : b
      );
      onBannersChange(newBanners);
      onFlashSuccess(`Slide "${banner.title || `#${banner.order}`}" is now ${updated.active ? "Active" : "Inactive"}`);
    } catch (err: any) {
      onError(err.message || "Failed to toggle banner status");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedBanners.length) return;

    setIsReordering(true);
    const newSorted = [...sortedBanners];
    const temp = newSorted[index];
    newSorted[index] = newSorted[targetIndex];
    newSorted[targetIndex] = temp;

    // Normalize order values
    const updatedWithOrder = newSorted.map((b, idx) => ({
      ...b,
      order: idx + 1,
    }));
    onBannersChange(updatedWithOrder);

    try {
      const bannerIds = updatedWithOrder.map((b) => b._id);
      await adminApi.reorderBanners(bannerIds);
      onFlashSuccess("Hero slide sequence updated");
    } catch (err: any) {
      onError(err.message || "Failed to update banner order");
      // Refresh list from server
      adminApi.getBanners().then((res) => onBannersChange(res || []));
    } finally {
      setIsReordering(false);
    }
  }

  async function handleDeleteBanner() {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteBanner(bannerToDelete._id);
      const remaining = banners.filter((b) => b._id !== bannerToDelete._id);
      onBannersChange(remaining);
      setBannerToDelete(null);
      onFlashSuccess("Banner slide permanently deleted from alikendshop.banners");
    } catch (err: any) {
      onError(err.message || "Failed to delete banner");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      onError("Please provide a valid image URL for this slide");
      return;
    }

    setIsSaving(true);
    try {
      if (editingBanner) {
        const updated = await adminApi.updateBanner(editingBanner._id, formData);
        const newBanners = banners.map((b) =>
          b._id === editingBanner._id ? { ...b, ...updated } : b
        );
        onBannersChange(newBanners);
        onFlashSuccess("Hero banner slide updated successfully");
      } else {
        const created = await adminApi.createBanner(formData);
        onBannersChange([...banners, created]);
        onFlashSuccess("New hero banner slide created and deployed");
      }
      setModalOpen(false);
      setEditingBanner(null);
    } catch (err: any) {
      onError(err.message || "Failed to save banner slide");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ap-vip-card bg-gradient-to-br from-[#1b1026] to-[#2a133a] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="ap-tag-label text-amber-300">Active Live Slides</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
              LIVE
            </div>
          </div>
          <div className="ap-tag-value text-3xl font-serif font-bold text-white mt-2">
            {activeCount} <span className="text-sm font-sans text-neutral-400 font-normal">/ {banners.length} total</span>
          </div>
          <div className="text-xs text-neutral-300 mt-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Rotates automatically on homepage hero carousel</span>
          </div>
        </div>

        <div className="ap-vip-card bg-gradient-to-br from-[#101b2b] to-[#142845] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="ap-tag-label text-cyan-300">Target Database Collection</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-mono font-bold text-cyan-100 mt-2 truncate">
            alikendshop.banners
          </div>
          <div className="text-xs text-neutral-300 mt-2">
            Order sequencing & active flag managed dynamically
          </div>
        </div>

        <div className="ap-vip-card bg-gradient-to-br from-[#261019] to-[#3d1425] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="ap-tag-label text-rose-300">Direct Actions</span>
              <ImageIcon className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-sm text-neutral-200 mt-2">
              Add new promotional slides with custom call-to-action buttons
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-3 ap-btn ap-btn-primary w-full flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hero Slide</span>
          </button>
        </div>
      </div>

      {/* Main Banners Table & Management Card */}
      <div className="ap-card bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="ap-card-head p-4 sm:p-5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-neutral-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#E8177D]" />
              <span>Hero Carousel Slides</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Reorder sequence with up/down controls, toggle active status, or edit content.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCreateModal}
              className="ap-btn ap-btn-primary flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Banner Slide</span>
            </button>
          </div>
        </div>

        {/* Banners List */}
        {sortedBanners.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <ImageIcon className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
            <p className="font-semibold text-neutral-800">No banner slides found</p>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Add your first hero banner slide to display on the storefront homepage.
            </p>
            <button onClick={openCreateModal} className="ap-btn ap-btn-primary text-xs">
              <Plus className="w-4 h-4 mr-1.5 inline" />
              Create Slide
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {sortedBanners.map((banner, index) => (
              <div
                key={banner._id}
                className={`p-4 sm:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  banner.active ? "bg-white hover:bg-neutral-50/70" : "bg-neutral-50/80 opacity-75"
                }`}
              >
                {/* Left: Sequence + Thumbnail + Content */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Sequence Reorder Controls */}
                  <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-neutral-100 p-1.5 rounded-xl border border-neutral-200">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0 || isReordering}
                      className="p-1 text-neutral-600 hover:text-black disabled:opacity-25 disabled:cursor-not-allowed hover:bg-neutral-200/80 rounded transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-neutral-700 px-1">
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === sortedBanners.length - 1 || isReordering}
                      className="p-1 text-neutral-600 hover:text-black disabled:opacity-25 disabled:cursor-not-allowed hover:bg-neutral-200/80 rounded transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-28 sm:w-36 h-18 sm:h-20 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 shrink-0 shadow-sm group">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || "Hero banner"}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute top-1.5 left-1.5">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          banner.active
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-neutral-700 text-neutral-300"
                        }`}
                      >
                        {banner.active ? "LIVE" : "DRAFT"}
                      </span>
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                        {banner.title || <span className="text-neutral-400 italic">No Title Set</span>}
                      </h4>
                      {banner.subtitle && (
                        <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 font-semibold border border-amber-500/20">
                          {banner.subtitle}
                        </span>
                      )}
                    </div>

                    {banner.description && (
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2 max-w-xl">
                        {banner.description}
                      </p>
                    )}

                    {/* Metadata chips */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px]">
                      {banner.buttonText && (
                        <span className="inline-flex items-center gap-1 font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          <span>Button:</span>
                          <strong className="text-neutral-900">{banner.buttonText}</strong>
                        </span>
                      )}
                      {banner.link && (
                        <span className="inline-flex items-center gap-1 font-mono text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{banner.link}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 w-full md:w-auto justify-end">
                  {/* Toggle Active Button */}
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`ap-btn ap-btn-sm flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                      banner.active
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
                    }`}
                    title={banner.active ? "Deactivate banner" : "Activate banner"}
                  >
                    {banner.active ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer border border-neutral-200"
                    title="Edit Slide"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setBannerToDelete(banner)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-100"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT BANNER MODAL */}
      {modalOpen && (
        <div className="ap-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="ap-modal max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
              <h3 className="text-lg font-serif font-bold text-neutral-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#E8177D]" />
                <span>{editingBanner ? "Edit Hero Banner Slide" : "Add New Hero Banner Slide"}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image URL Input */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">
                  Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="ap-input font-mono text-xs"
                  required
                />
                
                {/* Live Image Preview */}
                {formData.imageUrl && (
                  <div className="mt-2.5 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 h-32 relative shadow-inner">
                    <img
                      src={formData.imageUrl}
                      alt="Banner Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono">
                      Live Preview
                    </div>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="mt-2">
                  <span className="text-[11px] text-neutral-500 font-medium">Quick Image Presets:</span>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {PRESET_BANNER_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className="text-[10px] bg-neutral-100 hover:bg-[#E8177D]/10 hover:text-[#E8177D] text-neutral-700 px-2 py-1 rounded-md border border-neutral-200 transition-colors cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">
                    Slide Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smart Shopping Experience"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="ap-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">
                    Eyebrow / Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. THE NEW GOLD STANDARD"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="ap-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">
                  Description Text (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Plunge into our curated catalog of ultra-premium electronics, handcrafted jewelry, and designer apparel."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="ap-input text-xs"
                />
              </div>

              {/* CTA Button Text & Target Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">
                    Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Now"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="ap-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">
                    Link / Target (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. category_search or custom URL"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="ap-input font-mono text-xs"
                  />
                </div>
              </div>

              {/* Sequence Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">
                    Sequence Order Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="ap-input font-mono"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Lower numbers appear earlier in the slide carousel sequence.
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-2">
                    Slide Visibility
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E8177D] focus:ring-[#E8177D]"
                    />
                    <span className="text-xs font-semibold text-neutral-800">
                      Active (Live on homepage carousel)
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="ap-btn ap-btn-ghost text-xs"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ap-btn ap-btn-primary text-xs font-bold flex items-center gap-1.5"
                  disabled={isSaving}
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBanner ? "Save Changes" : "Deploy Slide"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE BANNER CONFIRMATION MODAL */}
      {bannerToDelete && (
        <div className="ap-modal-backdrop" onClick={() => setBannerToDelete(null)}>
          <div className="ap-modal max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Delete Banner Slide</h3>
                <p className="text-xs text-neutral-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="my-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
              <img
                src={bannerToDelete.imageUrl}
                alt="Banner preview"
                referrerPolicy="no-referrer"
                className="w-16 h-12 rounded object-cover border border-neutral-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-800 truncate">
                  {bannerToDelete.title || `Slide #${bannerToDelete.order}`}
                </p>
                <p className="text-[11px] font-mono text-neutral-500 truncate">
                  Order: #{bannerToDelete.order}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 mb-4">
              Are you sure you want to permanently delete this banner slide from the{" "}
              <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[11px]">
                alikendshop.banners
              </code>{" "}
              collection?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="ap-btn ap-btn-ghost text-xs"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBanner}
                className="ap-btn ap-btn-primary bg-rose-600 hover:bg-rose-700 text-xs font-bold flex items-center gap-1.5"
                disabled={isDeleting}
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Slide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
