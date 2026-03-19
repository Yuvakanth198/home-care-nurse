import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ImageIcon,
  Pencil,
  RefreshCw,
  Shield,
  Trash2,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Nurse, ServiceProof } from "../backend";
import {
  useDeleteNurse,
  useDeleteServiceProof,
  useGetNurseServiceProofs,
  useListAllNurses,
  useUpdateNurse,
  useUpdateServiceProof,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "RuralCare@Admin2024";

// ── Edit Nurse Form ────────────────────────────────────────────────────────────
interface EditNurseFormProps {
  nurse: Nurse;
  onClose: () => void;
}

function EditNurseForm({ nurse, onClose }: EditNurseFormProps) {
  const updateMutation = useUpdateNurse();
  const [form, setForm] = useState({
    name: nurse.name,
    registrationNumber: nurse.registrationNumber,
    phone: nurse.phone,
    village: nurse.village,
    mandal: nurse.mandal,
    district: nurse.district,
    pincode: String(nurse.pincode),
    experience: String(nurse.experience),
    bio: nurse.bio,
    isAvailable: nurse.isAvailable,
  });

  const nid = nurse.id.replace(/[^a-z0-9]/gi, "").slice(0, 8);

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updated: Nurse = {
      ...nurse,
      name: form.name,
      registrationNumber: form.registrationNumber,
      phone: form.phone,
      village: form.village,
      mandal: form.mandal,
      district: form.district,
      pincode: BigInt(form.pincode || "0"),
      experience: BigInt(form.experience || "0"),
      bio: form.bio,
      isAvailable: form.isAvailable,
    };
    updateMutation.mutate(updated, {
      onSuccess: () => {
        toast.success("Nurse details updated.");
        onClose();
      },
      onError: () => {
        toast.error("Failed to update nurse details.");
      },
    });
  }

  const fieldClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-blue-100 bg-blue-50 px-4 py-4"
      data-ocid="admin.edit_nurse.panel"
    >
      <h3 className="text-sm font-semibold text-blue-700 mb-3">
        Edit Nurse Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${nid}-name`} className={labelClass}>
            Full Name
          </label>
          <input
            id={`${nid}-name`}
            className={fieldClass}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            data-ocid="admin.edit_nurse.input"
          />
        </div>
        <div>
          <label htmlFor={`${nid}-reg`} className={labelClass}>
            Registration Number
          </label>
          <input
            id={`${nid}-reg`}
            className={fieldClass}
            value={form.registrationNumber}
            onChange={(e) => handleChange("registrationNumber", e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor={`${nid}-phone`} className={labelClass}>
            Phone
          </label>
          <input
            id={`${nid}-phone`}
            className={fieldClass}
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor={`${nid}-exp`} className={labelClass}>
            Experience (years)
          </label>
          <input
            id={`${nid}-exp`}
            type="number"
            min="0"
            className={fieldClass}
            value={form.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${nid}-village`} className={labelClass}>
            Village
          </label>
          <input
            id={`${nid}-village`}
            className={fieldClass}
            value={form.village}
            onChange={(e) => handleChange("village", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${nid}-mandal`} className={labelClass}>
            Mandal
          </label>
          <input
            id={`${nid}-mandal`}
            className={fieldClass}
            value={form.mandal}
            onChange={(e) => handleChange("mandal", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${nid}-district`} className={labelClass}>
            District
          </label>
          <input
            id={`${nid}-district`}
            className={fieldClass}
            value={form.district}
            onChange={(e) => handleChange("district", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${nid}-pincode`} className={labelClass}>
            Pincode (6 digits)
          </label>
          <input
            id={`${nid}-pincode`}
            type="number"
            min="100000"
            max="999999"
            className={fieldClass}
            value={form.pincode}
            onChange={(e) => handleChange("pincode", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${nid}-bio`} className={labelClass}>
            Bio
          </label>
          <textarea
            id={`${nid}-bio`}
            rows={2}
            className={fieldClass}
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            data-ocid="admin.edit_nurse.textarea"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id={`${nid}-avail`}
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => handleChange("isAvailable", e.target.checked)}
            className="w-4 h-4 accent-blue-600"
            data-ocid="admin.edit_nurse.checkbox"
          />
          <label htmlFor={`${nid}-avail`} className="text-sm text-gray-700">
            Available for service
          </label>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
          data-ocid="admin.edit_nurse.save_button"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="border border-gray-300 text-gray-600 text-sm rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors"
          data-ocid="admin.edit_nurse.cancel_button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Service Proofs ─────────────────────────────────────────────────────────────
interface NurseServiceProofsProps {
  nurseId: string;
}

function NurseServiceProofs({ nurseId }: NurseServiceProofsProps) {
  const { data: proofs, isLoading } = useGetNurseServiceProofs(nurseId);
  const deleteProofMutation = useDeleteServiceProof();
  const updateProofMutation = useUpdateServiceProof();

  const [confirmProofId, setConfirmProofId] = useState<string | null>(null);
  const [confirmMedia, setConfirmMedia] = useState<string | null>(null);

  function handleDeleteProof(proofId: string) {
    deleteProofMutation.mutate(proofId, {
      onSuccess: () => {
        toast.success("Service proof deleted.");
        setConfirmProofId(null);
      },
      onError: () => {
        toast.error("Failed to delete service proof.");
        setConfirmProofId(null);
      },
    });
  }

  function handleRemovePhoto(proof: ServiceProof, photoIdx: number) {
    const updated: ServiceProof = {
      ...proof,
      photoUrls: proof.photoUrls.filter((_, i) => i !== photoIdx),
    };
    updateProofMutation.mutate(updated, {
      onSuccess: () => {
        toast.success("Photo removed.");
        setConfirmMedia(null);
      },
      onError: () => {
        toast.error("Failed to remove photo.");
        setConfirmMedia(null);
      },
    });
  }

  function handleRemoveVideo(proof: ServiceProof) {
    const updated: ServiceProof = {
      ...proof,
      videoUrl: undefined,
    };
    updateProofMutation.mutate(updated, {
      onSuccess: () => {
        toast.success("Video removed.");
        setConfirmMedia(null);
      },
      onError: () => {
        toast.error("Failed to remove video.");
        setConfirmMedia(null);
      },
    });
  }

  if (isLoading) {
    return <p className="text-xs text-gray-400 py-2">Loading proofs...</p>;
  }

  if (!proofs || proofs.length === 0) {
    return (
      <p
        className="text-xs text-gray-400 py-2"
        data-ocid="admin.service_proof.empty_state"
      >
        No service proofs uploaded.
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-2">
      {proofs.map((proof: ServiceProof, pi) => {
        const photos = proof.photoUrls
          .map((b) => {
            try {
              return b.getDirectURL();
            } catch {
              return null;
            }
          })
          .filter(Boolean) as string[];

        let videoUrl: string | null = null;
        if (proof.videoUrl) {
          try {
            videoUrl = proof.videoUrl.getDirectURL();
          } catch {
            videoUrl = null;
          }
        }

        const date = new Date(
          Number(proof.createdAt) / 1_000_000,
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <div
            key={proof.id}
            className="bg-gray-50 rounded-xl border border-gray-200 p-3"
            data-ocid={`admin.service_proof.item.${pi + 1}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{date}</span>
              {confirmProofId === proof.id ? (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDeleteProof(proof.id)}
                    disabled={deleteProofMutation.isPending}
                    className="text-xs bg-red-600 text-white rounded px-2 py-1"
                    data-ocid={`admin.service_proof.confirm_button.${pi + 1}`}
                  >
                    {deleteProofMutation.isPending
                      ? "Deleting..."
                      : "Confirm Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmProofId(null)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    data-ocid={`admin.service_proof.cancel_button.${pi + 1}`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmProofId(proof.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 border border-red-200 rounded px-2 py-1"
                  data-ocid={`admin.service_proof.delete_button.${pi + 1}`}
                >
                  <Trash2 className="w-3 h-3" /> Delete All
                </button>
              )}
            </div>

            {proof.description && (
              <p className="text-xs text-gray-600 mb-2">{proof.description}</p>
            )}

            {/* Photos with individual remove */}
            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {photos.map((url, i) => {
                  const mediaKey = `${proof.id}:photo:${i}`;
                  const isPendingRemove = confirmMedia === mediaKey;
                  return (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt={`Service evidence ${pi + 1} item ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      {!isPendingRemove && (
                        <button
                          type="button"
                          onClick={() => setConfirmMedia(mediaKey)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow transition-colors"
                          title="Remove photo"
                          data-ocid={`admin.service_proof.upload_button.${pi + 1}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      {isPendingRemove && (
                        <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center gap-1 p-1">
                          <span className="text-white text-[10px] text-center leading-tight">
                            Remove?
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(proof, i)}
                              disabled={updateProofMutation.isPending}
                              className="bg-red-600 text-white text-[10px] rounded px-1.5 py-0.5"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmMedia(null)}
                              className="bg-white text-gray-700 text-[10px] rounded px-1.5 py-0.5"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Video with individual remove */}
            {videoUrl && (
              <div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Video className="w-3 h-3" /> Video
                </div>
                <video
                  src={videoUrl}
                  controls
                  preload="metadata"
                  className="w-full max-h-40 rounded-lg border border-gray-200"
                >
                  <track kind="captions" />
                </video>
                {confirmMedia === `${proof.id}:video` ? (
                  <div className="flex gap-2 items-center mt-1.5">
                    <span className="text-xs text-gray-600">
                      Remove this video?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(proof)}
                      disabled={updateProofMutation.isPending}
                      className="text-xs bg-red-600 text-white rounded px-2 py-0.5"
                    >
                      {updateProofMutation.isPending
                        ? "Removing..."
                        : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmMedia(null)}
                      className="text-xs border border-gray-300 rounded px-2 py-0.5"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmMedia(`${proof.id}:video`)}
                    className="mt-1.5 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 border border-red-200 rounded px-2 py-1"
                    data-ocid={`admin.service_proof.toggle.${pi + 1}`}
                  >
                    <Trash2 className="w-3 h-3" /> Remove Video
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Admin Dashboard Page ───────────────────────────────────────────────────────
export function AdminDashboardPage() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("adminAuth") === "true",
  );
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [expandedProofs, setExpandedProofs] = useState<Set<string>>(new Set());
  const [editingNurseId, setEditingNurseId] = useState<string | null>(null);

  const { data: nurses, isLoading, refetch } = useListAllNurses();
  const deleteMutation = useDeleteNurse();
  const qc = useQueryClient();

  useEffect(() => {
    if (authed) {
      qc.invalidateQueries({ queryKey: ["nurses"] });
      refetch();
    }
  }, [authed, qc, refetch]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuth", "true");
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password. Please try again.");
    }
  }

  function logout() {
    sessionStorage.removeItem("adminAuth");
    setAuthed(false);
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Nurse profile deleted.");
        setConfirmId(null);
      },
      onError: () => {
        toast.error("Failed to delete. Please try again.");
        setConfirmId(null);
      },
    });
  }

  function toggleProofs(nurseId: string) {
    setExpandedProofs((prev) => {
      const next = new Set(prev);
      if (next.has(nurseId)) next.delete(nurseId);
      else next.add(nurseId);
      return next;
    });
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mb-3">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Admin Access</h1>
            <p className="text-sm text-gray-500 mt-1">Home Care Nurse</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter admin password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="current-password"
                data-ocid="admin.input"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {pwError && (
              <p className="text-red-500 text-sm" data-ocid="admin.error_state">
                {pwError}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors"
              data-ocid="admin.submit_button"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-800">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                qc.invalidateQueries({ queryKey: ["nurses"] });
                refetch();
              }}
              className="text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-3 py-1 flex items-center gap-1"
              data-ocid="admin.secondary_button"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg px-3 py-1"
              data-ocid="admin.button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Registered Nurses
          {!isLoading && nurses && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({nurses.length} total)
            </span>
          )}
        </h2>

        {isLoading && (
          <div
            className="text-center py-12 text-gray-400"
            data-ocid="admin.loading_state"
          >
            Loading nurses...
          </div>
        )}

        {!isLoading && (!nurses || nurses.length === 0) && (
          <div
            className="text-center py-12 bg-white rounded-xl border"
            data-ocid="admin.empty_state"
          >
            <p className="text-gray-500">No nurses registered yet.</p>
          </div>
        )}

        {!isLoading && nurses && nurses.length > 0 && (
          <div className="space-y-3" data-ocid="admin.list">
            {nurses.map((nurse, idx) => {
              let photoUrl: string | undefined;
              try {
                photoUrl = nurse.profilePhoto?.getDirectURL();
              } catch {
                photoUrl = undefined;
              }
              const initials = (nurse.name || "?")
                .split(" ")
                .map((n: string) => n[0] || "")
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const proofsExpanded = expandedProofs.has(nurse.id);
              const isEditing = editingNurseId === nurse.id;

              return (
                <div
                  key={nurse.id}
                  className="bg-white rounded-xl border shadow-sm"
                  data-ocid={`admin.item.${idx + 1}`}
                >
                  {/* Nurse info row */}
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={nurse.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span className="text-blue-600 font-bold text-sm">
                          {initials}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {nurse.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reg: {nurse.registrationNumber} &middot; Pincode:{" "}
                        {String(nurse.pincode)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {nurse.phone} &middot; {String(nurse.experience)} yrs
                        exp
                      </p>
                      {(nurse.village || nurse.mandal || nurse.district) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[nurse.village, nurse.mandal, nurse.district]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 items-end">
                      {confirmId === nurse.id ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(nurse.id)}
                            disabled={deleteMutation.isPending}
                            className="text-xs bg-red-600 text-white rounded-lg px-3 py-1.5 font-semibold"
                            data-ocid={`admin.confirm_button.${idx + 1}`}
                          >
                            {deleteMutation.isPending
                              ? "Deleting..."
                              : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5"
                            data-ocid={`admin.cancel_button.${idx + 1}`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() =>
                              setEditingNurseId(isEditing ? null : nurse.id)
                            }
                            data-ocid={`admin.edit_button.${idx + 1}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            {isEditing ? "Close" : "Edit"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setConfirmId(nurse.id)}
                            data-ocid={`admin.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {isEditing && (
                    <EditNurseForm
                      nurse={nurse}
                      onClose={() => setEditingNurseId(null)}
                    />
                  )}

                  {/* Service proofs toggle */}
                  <div className="border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => toggleProofs(nurse.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                      data-ocid={`admin.service_proof.toggle.${idx + 1}`}
                    >
                      <span className="font-medium flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        View Service Proofs
                      </span>
                      {proofsExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {proofsExpanded && (
                      <div className="px-4 pb-4">
                        <NurseServiceProofs nurseId={nurse.id} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
