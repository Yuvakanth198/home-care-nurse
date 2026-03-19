import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch } from "@tanstack/react-router";
import {
  Loader2,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Nurse } from "../backend";
import { NurseCard } from "../components/NurseCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useFilterByPincode, useListAllNurses } from "../hooks/useQueries";

const SKELETON_IDS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; lat: number; lng: number }
  | { status: "error"; message: string };

export function NursesPage() {
  const { t } = useLanguage();
  const searchParams = useSearch({ strict: false }) as { pincode?: string };
  const [pincode, setPincode] = useState(searchParams.pincode || "");
  const [activeFilter, setActiveFilter] = useState(searchParams.pincode || "");
  const [activeTab, setActiveTab] = useState<"pincode" | "nearby">("pincode");
  const [geoState, setGeoState] = useState<GeoState>({ status: "idle" });
  const [radiusKm, setRadiusKm] = useState(15);

  useEffect(() => {
    if (searchParams.pincode) {
      setPincode(searchParams.pincode);
      setActiveFilter(searchParams.pincode);
    }
  }, [searchParams.pincode]);

  const { data: allNurses, isLoading: loadingAll } = useListAllNurses();
  const { data: filteredNurses, isLoading: loadingFiltered } =
    useFilterByPincode(activeFilter);

  const isPincodeFiltered = activeFilter.length === 6;

  const pincodeNurses = isPincodeFiltered ? filteredNurses : allNurses;
  const pincodeLoading = isPincodeFiltered ? loadingFiltered : loadingAll;

  const nearbyNursesWithDist: { nurse: Nurse; distanceKm: number }[] =
    geoState.status === "success" && allNurses
      ? allNurses
          .filter((n) => n.latitude !== undefined && n.longitude !== undefined)
          .map((n) => ({
            nurse: n,
            distanceKm: haversineKm(
              geoState.lat,
              geoState.lng,
              n.latitude as number,
              n.longitude as number,
            ),
          }))
          .filter((item) => item.distanceKm <= radiusKm)
          .sort((a, b) => a.distanceKm - b.distanceKm)
      : [];

  const handlePincodeSearch = () => setActiveFilter(pincode);
  const handleClearPincode = () => {
    setPincode("");
    setActiveFilter("");
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoState({
        status: "error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }
    setGeoState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setGeoState({
          status: "success",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        let message = "Unable to detect location. Please try again.";
        if (err.code === err.PERMISSION_DENIED)
          message =
            "Location permission denied. Please allow location access in your browser settings.";
        else if (err.code === err.TIMEOUT)
          message = "Location request timed out. Please try again.";
        setGeoState({ status: "error", message });
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleClearNearby = () => setGeoState({ status: "idle" });

  const renderSkeletons = () => (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      data-ocid="nurses.loading_state"
    >
      {SKELETON_IDS.map((skId) => (
        <div
          key={skId}
          className="bg-card rounded-xl overflow-hidden border border-border"
        >
          <Skeleton className="h-48 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t("nurses.title")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("nurses.subtitle")}</p>
      </div>

      <div
        className="bg-card border border-border rounded-xl p-4 mb-8 shadow-xs"
        data-ocid="nurses.panel"
      >
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "pincode" | "nearby")}
        >
          <TabsList className="w-full mb-4 h-11">
            <TabsTrigger
              value="pincode"
              className="flex-1 gap-2 text-sm"
              data-ocid="nurses.tab"
            >
              <Search size={14} />
              {t("nurses.tab.pincode")}
            </TabsTrigger>
            <TabsTrigger
              value="nearby"
              className="flex-1 gap-2 text-sm"
              data-ocid="nurses.tab"
            >
              <Navigation size={14} />
              {t("nurses.tab.nearby")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pincode" className="mt-0">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {t("nurses.pincode.label")}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 border border-border rounded-lg px-3 bg-background">
                <Search size={16} className="text-muted-foreground" />
                <Input
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder={t("nurses.pincode.placeholder")}
                  className="border-0 shadow-none focus-visible:ring-0 p-0 h-10"
                  maxLength={6}
                  inputMode="numeric"
                  onKeyDown={(e) => e.key === "Enter" && handlePincodeSearch()}
                  data-ocid="nurses.search_input"
                />
              </div>
              <Button
                onClick={handlePincodeSearch}
                className="bg-primary text-primary-foreground"
                data-ocid="nurses.primary_button"
              >
                {t("nurses.search")}
              </Button>
              {activeFilter && (
                <Button
                  variant="outline"
                  onClick={handleClearPincode}
                  data-ocid="nurses.secondary_button"
                >
                  {t("nurses.clear")}
                </Button>
              )}
            </div>
            {isPincodeFiltered && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("nurses.showing")} <strong>{activeFilter}</strong>
              </p>
            )}
          </TabsContent>

          <TabsContent value="nearby" className="mt-0">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {t("nurses.nearby.within")} {radiusKm} {t("nurses.nearby.km")}
              </span>
            </div>
            <div className="flex gap-2 mb-4">
              {[10, 12, 15].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setRadiusKm(km)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    radiusKm === km
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-foreground hover:border-primary/60"
                  }`}
                  data-ocid="nurses.toggle"
                >
                  {km} km
                </button>
              ))}
            </div>

            {geoState.status === "idle" && (
              <Button
                onClick={handleDetectLocation}
                className="w-full h-12 bg-primary text-white font-semibold text-base gap-2"
                data-ocid="nurses.primary_button"
              >
                <Navigation size={18} />
                {t("nurses.nearby.detect")}
              </Button>
            )}
            {geoState.status === "loading" && (
              <div
                className="flex items-center justify-center gap-3 py-4 text-primary"
                data-ocid="nurses.loading_state"
              >
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm font-medium">
                  {t("nurses.nearby.detecting")}
                </span>
              </div>
            )}
            {geoState.status === "success" && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} style={{ color: "#0056b3" }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#0056b3" }}
                  >
                    {t("nurses.nearby.detected")} ({geoState.lat.toFixed(4)},{" "}
                    {geoState.lng.toFixed(4)})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearNearby}
                  className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
                  data-ocid="nurses.secondary_button"
                >
                  {t("nurses.clear")}
                </Button>
              </div>
            )}
            {geoState.status === "error" && (
              <>
                <div
                  className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3 mb-3"
                  data-ocid="nurses.error_state"
                >
                  {geoState.message}
                </div>
                <Button
                  onClick={handleDetectLocation}
                  variant="outline"
                  className="w-full mt-2 gap-2"
                  data-ocid="nurses.secondary_button"
                >
                  <Navigation size={16} />
                  {t("nurses.nearby.tryAgain")}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {activeTab === "pincode" ? (
        pincodeLoading ? (
          renderSkeletons()
        ) : pincodeNurses && pincodeNurses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pincodeNurses.map((nurse, i) => (
              <NurseCard key={nurse.id} nurse={nurse} index={i + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" data-ocid="nurses.empty_state">
            <UserX size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg text-foreground mb-1">
              {isPincodeFiltered
                ? t("nurses.noResults")
                : t("nurses.noRegistered")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isPincodeFiltered
                ? `${t("nurses.noResults.hint")} ${activeFilter}. ${t("nurses.noResults.hint2")}`
                : t("nurses.noRegistered.hint")}
            </p>
            {isPincodeFiltered && (
              <Button
                variant="outline"
                onClick={handleClearPincode}
                className="mt-4"
                data-ocid="nurses.secondary_button"
              >
                {t("nurses.showAll")}
              </Button>
            )}
          </div>
        )
      ) : geoState.status === "success" ? (
        loadingAll ? (
          renderSkeletons()
        ) : nearbyNursesWithDist.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {t("nurses.nearby.found")}{" "}
              <strong>{nearbyNursesWithDist.length}</strong>{" "}
              {nearbyNursesWithDist.length !== 1
                ? t("nurses.nearby.foundPlural")
                : t("nurses.nearby.found")}{" "}
              {t("nurses.nearby.foundWithin")} {radiusKm} km
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearbyNursesWithDist.map(({ nurse, distanceKm }, i) => (
                <NurseCard
                  key={nurse.id}
                  nurse={nurse}
                  index={i + 1}
                  distanceKm={distanceKm}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16" data-ocid="nurses.empty_state">
            <Navigation
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <h3 className="font-semibold text-lg text-foreground mb-1">
              {t("nurses.nearby.noResults")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("nurses.nearby.noResults.hint")} {radiusKm}{" "}
              {t("nurses.nearby.noResults.hint2")}
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-16" data-ocid="nurses.empty_state">
          <Navigation
            size={48}
            className="mx-auto text-muted-foreground mb-4"
          />
          <h3 className="font-semibold text-lg text-foreground mb-1">
            {t("nurses.nearby.detectPrompt")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("nurses.nearby.detectHint")} {radiusKm} {t("nurses.nearby.km2")}
          </p>
        </div>
      )}
    </div>
  );
}
