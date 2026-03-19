import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import type { Nurse } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";

interface NurseCardProps {
  nurse: Nurse;
  index?: number;
  distanceKm?: number;
}

export function NurseCard({ nurse, index = 1, distanceKm }: NurseCardProps) {
  const { t } = useLanguage();
  let photoUrl = "";
  try {
    photoUrl = nurse.profilePhoto ? nurse.profilePhoto.getDirectURL() : "";
  } catch {
    photoUrl = "";
  }
  const initials = nurse.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const locationParts = [nurse.village, nurse.mandal, nurse.district]
    .filter(Boolean)
    .join(", ");
  const locationDisplay = locationParts
    ? `${locationParts} — ${nurse.pincode.toString()}`
    : nurse.pincode.toString();

  return (
    <Card
      className="overflow-hidden border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
      style={{
        borderRadius: "20px",
        boxShadow: "0 2px 12px rgba(0,86,179,0.10)",
      }}
      data-ocid={`nurses.item.${index}`}
    >
      <CardContent className="p-5">
        {distanceKm !== undefined && (
          <div className="mb-3 flex justify-end">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#dbeafe", color: "#0056b3" }}
            >
              <Navigation size={11} />
              {distanceKm.toFixed(1)} {t("nurses.away")}
            </span>
          </div>
        )}
        <div className="flex gap-4 items-start">
          <div className="shrink-0">
            <Avatar
              className="w-20 h-20 ring-2 ring-blue-600 ring-offset-2"
              style={{ borderRadius: "50%" }}
            >
              <AvatarImage
                src={photoUrl}
                alt={nurse.name}
                className="object-cover"
              />
              <AvatarFallback
                className="text-xl font-bold"
                style={{ background: "#dbeafe", color: "#0056b3" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link to="/nurses/$id" params={{ id: nurse.id }}>
                <h3
                  className="font-bold text-base hover:underline leading-tight"
                  style={{ color: "#0056b3" }}
                >
                  {nurse.name}
                </h3>
              </Link>
              <Badge
                className={`shrink-0 text-xs ${nurse.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {nurse.isAvailable ? t("card.available") : t("card.busy")}
              </Badge>
            </div>
            {nurse.registrationNumber && (
              <div className="flex items-center mt-0.5 flex-wrap gap-1">
                <span className="text-xs text-gray-500">
                  {t("card.reg")} {nurse.registrationNumber}
                </span>
                <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {t("card.verified")}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} style={{ color: "#0056b3" }} />
                <span>
                  {Number(nurse.experience)} {t("card.experience")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} style={{ color: "#0056b3" }} />
                <span>{locationDisplay}</span>
              </div>
            </div>
            <a
              href={`tel:${nurse.phone}`}
              className="call-btn mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm"
              data-ocid={`nurses.button.${index}`}
            >
              <Phone size={15} />
              {t("card.callNow")}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SampleNurseCardProps {
  name: string;
  experience: number;
  pincode: string;
  phone: string;
  isAvailable: boolean;
  photoUrl: string;
  initials: string;
  id: string;
  registrationNumber?: string;
  village?: string;
  mandal?: string;
  district?: string;
  index?: number;
}

export function SampleNurseCard({
  name,
  experience,
  pincode,
  phone,
  isAvailable,
  photoUrl,
  initials,
  id,
  registrationNumber,
  village,
  mandal,
  district,
  index = 1,
}: SampleNurseCardProps) {
  const { t } = useLanguage();
  const locationParts = [village, mandal, district].filter(Boolean).join(", ");
  const locationDisplay = locationParts
    ? `${locationParts} — ${pincode}`
    : pincode;

  return (
    <Card
      className="overflow-hidden border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
      style={{
        borderRadius: "20px",
        boxShadow: "0 2px 12px rgba(0,86,179,0.10)",
      }}
      data-ocid={`nurses.item.${index}`}
    >
      <CardContent className="p-5">
        <div className="flex gap-4 items-start">
          <div className="shrink-0">
            <Avatar
              className="w-20 h-20 ring-2 ring-blue-600 ring-offset-2"
              style={{ borderRadius: "50%" }}
            >
              <AvatarImage src={photoUrl} alt={name} className="object-cover" />
              <AvatarFallback
                className="text-xl font-bold"
                style={{ background: "#dbeafe", color: "#0056b3" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link to="/nurses/$id" params={{ id }}>
                <h3
                  className="font-bold text-base hover:underline leading-tight"
                  style={{ color: "#0056b3" }}
                >
                  {name}
                </h3>
              </Link>
              <Badge
                className={`shrink-0 text-xs ${isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {isAvailable ? t("card.available") : t("card.busy")}
              </Badge>
            </div>
            {registrationNumber && (
              <div className="flex items-center mt-0.5 flex-wrap gap-1">
                <span className="text-xs text-gray-500">
                  {t("card.reg")} {registrationNumber}
                </span>
                <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {t("card.verified")}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} style={{ color: "#0056b3" }} />
                <span>
                  {experience} {t("card.experience")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} style={{ color: "#0056b3" }} />
                <span>{locationDisplay}</span>
              </div>
            </div>
            <a
              href={`tel:${phone}`}
              className="call-btn mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm"
              data-ocid={`nurses.button.${index}`}
            >
              <Phone size={15} />
              {t("card.callNow")}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
