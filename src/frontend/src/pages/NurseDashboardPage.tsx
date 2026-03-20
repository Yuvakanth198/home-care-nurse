import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  CheckCircle2,
  FileVideo,
  Loader2,
  LogIn,
  MapPin,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Nurse, ServiceProof } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAddServiceProof,
  useFindNurseByCredentials,
  useGetNurseServiceProofs,
  useSetNurseAvailability,
  useUpdateNurseLocation,
} from "../hooks/useQueries";
import { v4 as generateUUID } from "../utils/uuid";

function ServiceProofCard({
  proof,
  index,
}: {
  proof: ServiceProof;
  index: number;
}) {
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

  const date = new Date(Number(proof.createdAt) / 1_000_000).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" },
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4"
      data-ocid={`service_proof.item.${index}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{date}</span>
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
          Service Proof
        </Badge>
      </div>
      {proof.description && (
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
          {proof.description}
        </p>
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {photos.map((url, i) => (
            <img
              key={url}
              src={url}
              alt={`Service evidence ${i + 1}`}
              className="w-full h-32 object-cover rounded-xl border border-gray-100"
            />
          ))}
        </div>
      )}
      {videoUrl && (
        <video
          src={videoUrl}
          controls
          preload="metadata"
          className="w-full rounded-xl border border-gray-100 max-h-56"
        >
          <track kind="captions" />
        </video>
      )}
    </motion.div>
  );
}

export function NurseDashboardPage() {
  const { t } = useLanguage();
  const [regNum, setRegNum] = useState("");
  const [phone, setPhone] = useState("");
  const [nurse, setNurse] = useState<Nurse | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "detecting" | "success" | "error"
  >("idle");
  const [detectedLocation, setDetectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const availabilityMutation = useSetNurseAvailability();
  const locationMutation = useUpdateNurseLocation();
  const findMutation = useFindNurseByCredentials();
  const addProofMutation = useAddServiceProof();
  const { data: proofs, isLoading: proofsLoading } = useGetNurseServiceProofs(
    nurse?.id ?? "",
  );

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!regNum.trim() || !phone.trim()) {
      toast.error("Please enter both registration number and phone.");
      return;
    }
    findMutation.mutate(
      { registrationNumber: regNum.trim(), phone: phone.trim() },
      {
        onSuccess: (result) => {
          if (result) {
            setNurse(result);
            setIsAvailable(!!(result as Nurse).isAvailable);
          } else {
            toast.error(
              "Nurse not found. Please check your registration number and phone.",
            );
          }
        },
        onError: () => {
          toast.error("Failed to look up profile. Please try again.");
        },
      },
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 2 - photos.length;
    const toAdd = files.slice(0, remaining);
    if (toAdd.length === 0) {
      toast.error("You can only upload up to 2 photos.");
      return;
    }
    const oversized = toAdd.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error("Each photo must be under 5MB.");
      return;
    }
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...toAdd]);
    setPhotoPreviewUrls((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  }

  function removePhoto(idx: number) {
    URL.revokeObjectURL(photoPreviewUrls[idx]);
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be under 100MB.");
      return;
    }
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideo(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  }

  function removeVideo() {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideo(null);
    setVideoPreviewUrl(null);
  }

  function handleDetectAndSaveLocation() {
    if (!nurse) return;
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDetectedLocation({ lat, lng });
        locationMutation.mutate(
          {
            registrationNumber: nurse.registrationNumber,
            phone: nurse.phone,
            latitude: lat,
            longitude: lng,
          },
          {
            onSuccess: () => {
              setLocationStatus("success");
              // Also update the local nurse state so it stays in sync
              setNurse((prev) =>
                prev ? { ...prev, latitude: lat, longitude: lng } : prev,
              );
              toast.success("Location updated successfully!");
              setTimeout(() => setLocationStatus("idle"), 4000);
            },
            onError: () => {
              setLocationStatus("error");
              toast.error("Failed to save location. Please try again.");
            },
          },
        );
      },
      () => {
        setLocationStatus("error");
        toast.error("Could not detect location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!nurse) return;
    if (photos.length === 0 && !video) {
      toast.error("Please add at least one photo or video.");
      return;
    }

    try {
      const photoBlobs = await Promise.all(
        photos.map(async (f) => {
          const bytes = new Uint8Array(await f.arrayBuffer());
          return ExternalBlob.fromBytes(bytes);
        }),
      );

      let videoBlob: ExternalBlob | undefined;
      if (video) {
        const bytes = new Uint8Array(await video.arrayBuffer());
        videoBlob = ExternalBlob.fromBytes(bytes);
      }

      const proof: ServiceProof = {
        id: generateUUID(),
        nurseId: nurse.id,
        description: description.trim(),
        photoUrls: photoBlobs,
        videoUrl: videoBlob,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      };

      addProofMutation.mutate(proof, {
        onSuccess: () => {
          setUploadSuccess(true);
          setDescription("");
          setPhotos([]);
          for (const u of photoPreviewUrls) URL.revokeObjectURL(u);
          setPhotoPreviewUrls([]);
          if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
          setVideo(null);
          setVideoPreviewUrl(null);
          toast.success(t("dashboard.success"));
          setTimeout(() => setUploadSuccess(false), 4000);
        },
        onError: () => {
          toast.error("Upload failed. Please try again.");
        },
      });
    } catch {
      toast.error("Failed to process files. Please try again.");
    }
  }

  // --- Login screen ---
  if (!nurse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-blue-100 p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("dashboard.title")}
            </h1>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {t("dashboard.login.desc")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="regNum"
                className="text-sm font-medium text-gray-700"
              >
                {t("dashboard.regNo")}
              </Label>
              <Input
                id="regNum"
                value={regNum}
                onChange={(e) => setRegNum(e.target.value)}
                placeholder={t("dashboard.regNo.placeholder")}
                className="rounded-xl border-blue-200 focus:ring-blue-500"
                data-ocid="nurse_dashboard.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                {t("dashboard.phone")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("dashboard.phone.placeholder")}
                className="rounded-xl border-blue-200 focus:ring-blue-500"
                data-ocid="nurse_dashboard.input"
              />
            </div>
            <Button
              type="submit"
              disabled={findMutation.isPending}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold"
              data-ocid="nurse_dashboard.submit_button"
            >
              {findMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("dashboard.logging")}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t("dashboard.loginBtn")}
                </>
              )}
            </Button>
            {findMutation.isError && (
              <p
                className="text-red-500 text-sm text-center"
                data-ocid="nurse_dashboard.error_state"
              >
                {t("dashboard.error")}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    );
  }

  // --- Dashboard screen ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">
                  {t("dashboard.title")}
                </p>
                <h1 className="text-2xl font-bold text-gray-800">
                  {t("dashboard.welcome")}, {nurse.name}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {t("profile.reg")} {nurse.registrationNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNurse(null)}
                className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                data-ocid="nurse_dashboard.button"
              >
                {t("dashboard.logout")}
              </button>
            </div>
          </div>

          {/* Availability Card */}
          <div
            className={`rounded-3xl border shadow-sm p-6 mb-6 transition-colors ${
              isAvailable
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                    isAvailable ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {t("dashboard.availability")}
                </p>
                <h2 className="text-lg font-bold text-gray-800 mb-0.5">
                  {t("dashboard.availability.toggle")}
                </h2>
                <p className="text-xs text-gray-500">
                  {t("dashboard.availability.hint")}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 ml-4">
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    isAvailable
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {isAvailable
                    ? t("dashboard.availability.on")
                    : t("dashboard.availability.off")}
                </span>
                <Switch
                  checked={isAvailable}
                  disabled={availabilityMutation.isPending}
                  onCheckedChange={(val) => {
                    availabilityMutation.mutate(
                      {
                        registrationNumber: nurse.registrationNumber,
                        phone: nurse.phone,
                        isAvailable: val,
                      },
                      {
                        onSuccess: () => {
                          setIsAvailable(val);
                          // Also update the nurse object so data is consistent
                          setNurse((prev) =>
                            prev ? { ...prev, isAvailable: val } : prev,
                          );
                          toast.success(t("dashboard.availability.saved"));
                        },
                        onError: () => {
                          toast.error(t("dashboard.availability.error"));
                        },
                      },
                    );
                  }}
                  data-ocid="nurse_dashboard.toggle"
                />
              </div>
            </div>
          </div>

          {/* Update Location Card */}
          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Update My Location
                </h2>
                <p className="text-sm text-gray-500">
                  Tap the button to update your GPS location. This helps
                  patients find you nearby.
                </p>
              </div>
            </div>

            {locationStatus === "success" && detectedLocation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-green-700 text-sm"
                data-ocid="nurse_dashboard.success_state"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Location saved: {detectedLocation.lat.toFixed(4)},{" "}
                {detectedLocation.lng.toFixed(4)}
              </motion.div>
            )}

            {locationStatus === "error" && (
              <div
                className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm"
                data-ocid="nurse_dashboard.error_state"
              >
                <X className="w-4 h-4 shrink-0" />
                Could not detect location. Please allow location access and try
                again.
              </div>
            )}

            <Button
              type="button"
              onClick={handleDetectAndSaveLocation}
              disabled={
                locationStatus === "detecting" || locationMutation.isPending
              }
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold"
              data-ocid="nurse_dashboard.button"
            >
              {locationStatus === "detecting" || locationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting location...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Detect &amp; Update My Location
                </>
              )}
            </Button>
          </div>

          {/* Upload form */}
          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {t("dashboard.uploadProof")}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {t("dashboard.subtitle")}
            </p>

            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-green-700 text-sm"
                data-ocid="nurse_dashboard.success_state"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {t("dashboard.success")}
              </motion.div>
            )}

            <form onSubmit={handleUpload} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  {t("dashboard.description")}
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("dashboard.description.placeholder")}
                  className="rounded-xl border-blue-200 resize-none"
                  rows={3}
                  data-ocid="nurse_dashboard.textarea"
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t("dashboard.photos")}{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    ({t("dashboard.photos.hint")})
                  </span>
                </Label>
                <div className="flex flex-wrap gap-3">
                  {photoPreviewUrls.map((url, idx) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-28 h-28 object-cover rounded-xl border border-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        data-ocid={`nurse_dashboard.delete_button.${idx + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 2 && (
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-28 h-28 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center gap-1 text-blue-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      data-ocid="nurse_dashboard.upload_button"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-xs">
                        Add Photo ({photos.length}/2)
                      </span>
                    </button>
                  )}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Video */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t("dashboard.video")}{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    ({t("dashboard.video.hint")})
                  </span>
                </Label>
                {videoPreviewUrl ? (
                  <div className="relative">
                    <video
                      src={videoPreviewUrl}
                      controls
                      preload="metadata"
                      className="w-full rounded-xl border border-blue-100 max-h-48"
                    >
                      <track kind="captions" />
                    </video>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                      data-ocid="nurse_dashboard.delete_button"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center gap-1 text-blue-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    data-ocid="nurse_dashboard.upload_button"
                  >
                    <FileVideo className="w-6 h-6" />
                    <span className="text-sm">Click to add video</span>
                    <span className="text-xs text-gray-400">
                      MP4/MOV/WEBM · max 100MB
                    </span>
                  </button>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  className="hidden"
                  onChange={handleVideoChange}
                />
              </div>

              <Button
                type="submit"
                disabled={addProofMutation.isPending}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold"
                data-ocid="nurse_dashboard.submit_button"
              >
                {addProofMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("dashboard.uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("dashboard.submit")}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Previous proofs */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {t("dashboard.proofs")}
            </h2>
            {proofsLoading ? (
              <div
                className="space-y-3"
                data-ocid="service_proof.loading_state"
              >
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
              </div>
            ) : proofs && proofs.length > 0 ? (
              <div className="space-y-4">
                {proofs.map((proof, idx) => (
                  <ServiceProofCard
                    key={proof.id}
                    proof={proof}
                    index={idx + 1}
                  />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-12 bg-white rounded-2xl border border-blue-100"
                data-ocid="service_proof.empty_state"
              >
                <Upload size={32} className="mx-auto text-blue-200 mb-2" />
                <p className="text-gray-400 text-sm">
                  {t("dashboard.noProofs")}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
