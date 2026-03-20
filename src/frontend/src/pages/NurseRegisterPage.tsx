import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, MapPin, Navigation } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useActor } from "../hooks/useActor";
import { useRegisterNurse } from "../hooks/useQueries";
import { extractICPError } from "../utils/icpError";
import { v4 as uuidv4 } from "../utils/uuid";

interface FormState {
  name: string;
  registrationNumber: string;
  phone: string;
  village: string;
  mandal: string;
  district: string;
  pincode: string;
  experience: string;
  bio: string;
  isAvailable: boolean;
  photoFile: File | null;
  latitude?: number;
  longitude?: number;
}

const EMPTY: FormState = {
  name: "",
  registrationNumber: "",
  phone: "",
  village: "",
  mandal: "",
  district: "",
  pincode: "",
  experience: "",
  bio: "",
  isAvailable: true,
  photoFile: null,
  latitude: undefined,
  longitude: undefined,
};

type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export function NurseRegisterPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [success, setSuccess] = useState(false);
  const [successName, setSuccessName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<LocationState>({
    status: "idle",
  });
  const { actor, isFetching: actorLoading } = useActor();
  const registerNurse = useRegisterNurse();

  const set = (
    key: keyof FormState,
    value: string | boolean | File | null | number | undefined,
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({
        status: "error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }
    setLocationState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocationState({ status: "success" });
      },
      (err) => {
        let message = "Unable to detect location. Please try again.";
        if (err.code === err.PERMISSION_DENIED)
          message =
            "Location permission denied. Please allow location access in your browser settings.";
        else if (err.code === err.TIMEOUT)
          message = "Location request timed out. Please try again.";
        setLocationState({ status: "error", message });
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Pre-flight validation
    if (!form.name.trim()) {
      setSubmitError("[E010] Name is required");
      return;
    }
    if (!form.phone.trim()) {
      setSubmitError("[E011] Phone number is required");
      return;
    }
    if (!form.registrationNumber.trim()) {
      setSubmitError("[E012] Nursing Council Registration Number is required");
      return;
    }
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) {
      setSubmitError("[E013] Pincode must be exactly 6 digits (e.g. 530001)");
      return;
    }
    if (form.latitude === undefined || form.longitude === undefined) {
      setSubmitError(
        t("register.location.required") ||
          "[E014] Location is required. Please use 'Detect My Location' button.",
      );
      return;
    }
    if (!actor) {
      setSubmitError(
        "[E001] Backend not ready. Please wait a moment and try again.",
      );
      return;
    }

    let pincodeBig: bigint;
    let experienceBig: bigint;
    try {
      pincodeBig = BigInt(form.pincode.trim());
    } catch {
      setSubmitError(
        "[E013] Invalid Pincode. Must be exactly 6 digits (e.g. 530001).",
      );
      return;
    }
    try {
      experienceBig = BigInt(form.experience.trim() || "0");
    } catch {
      setSubmitError(
        "[E014] Invalid value in Experience field. Please enter a number.",
      );
      return;
    }

    try {
      // Build nurse object with ALL fields explicitly declared
      // (prevents Candid serialization failures from missing optional fields)
      const nursePayload = {
        id: uuidv4(),
        name: form.name.trim(),
        registrationNumber: form.registrationNumber.trim(),
        phone: form.phone.trim(),
        village: form.village.trim(),
        mandal: form.mandal.trim(),
        district: form.district.trim(),
        pincode: pincodeBig,
        experience: experienceBig,
        bio: form.bio.trim(),
        isAvailable: form.isAvailable,
        profilePhoto: undefined as undefined,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      console.log("[Registration] Submitting payload:", {
        ...nursePayload,
        id: `${nursePayload.id.substring(0, 8)}...`,
      });

      await registerNurse.mutateAsync(nursePayload);
      setSuccessName(form.name);
      setSuccess(true);
      setForm(EMPTY);
      setLocationState({ status: "idle" });
    } catch (err) {
      console.error("[Registration] Raw error object:", err);
      const { message, code } = extractICPError(err);
      setSubmitError(`[${code}] ${message}`);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">
            {t("register.success.title") || "Registration Successful!"}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("register.success.message") ||
              `Welcome, ${successName}! Your profile is now live and patients can find you.`}
          </p>
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={() => setSuccess(false)}
          >
            {t("register.success.another") || "Register Another Nurse"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="bg-primary py-10 px-4 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">
          {t("register.title") || "Nurse Registration"}
        </h1>
        <p className="text-blue-100">
          {t("register.subtitle") ||
            "Join our network of certified home care nurses"}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <span>👤</span>
              {t("register.section.personal") || "Personal Information"}
            </h3>

            <div>
              <Label htmlFor="name">
                {t("register.name") || "Full Name"}
                <span className="text-red-500"> *</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={
                  t("register.name.placeholder") || "Enter your full name"
                }
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="registrationNumber">
                {t("register.regNumber") ||
                  "Nursing Council Registration Number"}
                <span className="text-red-500"> *</span>
              </Label>
              <Input
                id="registrationNumber"
                value={form.registrationNumber}
                onChange={(e) => set("registrationNumber", e.target.value)}
                placeholder="e.g. AP/RN/12345"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">
                {t("register.phone") || "Mobile Number"}
                <span className="text-red-500"> *</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="10-digit mobile number"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="experience">
                {t("register.experience") || "Years of Experience"}
              </Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
                placeholder="e.g. 5"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bio">
                {t("register.bio") || "Short Bio / Skills"}
              </Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder={
                  t("register.bio.placeholder") ||
                  "Describe your skills and experience..."
                }
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <span>🏘️</span>
              {t("register.section.address") || "Address"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="village">
                  {t("register.village") || "Village"}
                </Label>
                <Input
                  id="village"
                  value={form.village}
                  onChange={(e) => set("village", e.target.value)}
                  placeholder="Village name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mandal">
                  {t("register.mandal") || "Mandal"}
                </Label>
                <Input
                  id="mandal"
                  value={form.mandal}
                  onChange={(e) => set("mandal", e.target.value)}
                  placeholder="Mandal name"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="district">
                  {t("register.district") || "District"}
                </Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  placeholder="District name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pincode">
                  {t("register.pincode") || "Pincode"}
                  <span className="text-red-500"> *</span>
                </Label>
                <Input
                  id="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) =>
                    set("pincode", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="6-digit pincode"
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t("register.section.location") || "Your Location"}
              <span className="text-red-500"> *</span>
            </h3>
            <p className="text-sm text-gray-500">
              {t("register.location.info") ||
                "Your location helps patients find you for home visits."}
            </p>

            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/5"
              onClick={handleDetectLocation}
              disabled={locationState.status === "loading"}
            >
              {locationState.status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Detecting...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />{" "}
                  {t("register.detectLocation") || "Detect My Location"}{" "}
                  <span className="text-red-500 ml-1">*</span>
                </>
              )}
            </Button>

            {locationState.status === "success" && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  {t("register.location.detected") ||
                    "Location detected successfully!"}{" "}
                  ({form.latitude?.toFixed(4)}, {form.longitude?.toFixed(4)})
                </span>
              </div>
            )}
            {locationState.status === "error" && (
              <div className="text-red-500 text-sm bg-red-50 rounded-lg p-3">
                {locationState.message}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {t("register.availability") || "Available for Appointments"}
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  {t("register.availability.info") ||
                    "Patients can book appointments with you"}
                </p>
              </div>
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(v) => set("isAvailable", v)}
              />
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm font-medium">{submitError}</p>
              <p className="text-red-500 text-xs mt-1">
                {t("register.error.help") ||
                  "If this error persists, open browser console (F12) and note the [ICP Error Raw] line."}
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold rounded-2xl"
            disabled={
              actorLoading ||
              !actor ||
              registerNurse.isPending ||
              locationState.status === "loading"
            }
          >
            {registerNurse.isPending || actorLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {actorLoading
                  ? t("register.connecting") || "Connecting to backend..."
                  : t("register.submitting") || "Registering..."}
              </>
            ) : (
              t("register.submit") || "Register as Nurse"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
