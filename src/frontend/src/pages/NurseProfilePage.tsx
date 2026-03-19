import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  ImageIcon,
  MapPin,
  MessageSquarePlus,
  Phone,
  Star,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ServiceProof } from "../backend";
import { FeedbackCard, SampleFeedbackCard } from "../components/FeedbackCard";
import { FeedbackForm } from "../components/FeedbackForm";
import { StarRating } from "../components/StarRating";
import { SAMPLE_FEEDBACK, SAMPLE_NURSES } from "../data/sampleNurses";
import {
  useGetAggregateRating,
  useGetNurse,
  useGetNurseFeedback,
  useGetNurseServiceProofs,
} from "../hooks/useQueries";

function ServiceProofGallery({ nurseId }: { nurseId: string }) {
  const { data: proofs, isLoading } = useGetNurseServiceProofs(nurseId);

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
        data-ocid="service_proof.loading_state"
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!proofs || proofs.length === 0) {
    return (
      <div
        className="text-center py-10 bg-muted/40 rounded-xl"
        data-ocid="service_proof.empty_state"
      >
        <ImageIcon size={28} className="mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">
          No service proofs uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <motion.div
            key={proof.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pi * 0.07 }}
            className="bg-muted/30 rounded-2xl p-4 border border-border"
            data-ocid={`service_proof.item.${pi + 1}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{date}</span>
              <Badge
                variant="outline"
                className="text-xs text-primary border-primary/40"
              >
                Verified Service
              </Badge>
            </div>
            {proof.description && (
              <p className="text-sm text-foreground mb-3 leading-relaxed">
                {proof.description}
              </p>
            )}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {photos.map((url, i) => (
                  <img
                    key={url}
                    src={url}
                    alt={`Service evidence ${pi + 1} item ${i + 1}`}
                    className="w-full h-36 object-cover rounded-xl border border-border"
                  />
                ))}
              </div>
            )}
            {videoUrl && (
              <div className="mt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                  <Video size={12} />
                  <span>Service Video</span>
                </div>
                <video
                  src={videoUrl}
                  controls
                  preload="metadata"
                  className="w-full rounded-xl border border-border max-h-64"
                >
                  <track kind="captions" />
                </video>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function NurseProfilePage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const { data: nurse, isLoading } = useGetNurse(id);
  const { data: feedbackList, isLoading: feedbackLoading } =
    useGetNurseFeedback(id);
  const { data: aggregateRating } = useGetAggregateRating(id);

  const sampleNurse = id.startsWith("sample-")
    ? SAMPLE_NURSES.find((n) => n.id === id)
    : null;

  if (isLoading && !sampleNurse) {
    return (
      <div
        className="container mx-auto px-4 py-8"
        data-ocid="nurse_profile.loading_state"
      >
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-64 h-64 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (sampleNurse && !nurse) {
    const sampleLocation = [
      sampleNurse.village,
      sampleNurse.mandal,
      sampleNurse.district,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <div className="container mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() =>
            navigate({ to: "/nurses", search: { pincode: undefined } })
          }
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          data-ocid="nurse_profile.link"
        >
          <ArrowLeft size={16} /> Back to Nurses
        </button>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="shrink-0">
              <Avatar className="w-48 h-48 mx-auto md:mx-0 rounded-2xl">
                <AvatarImage
                  src={sampleNurse.photoUrl}
                  alt={sampleNurse.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground rounded-2xl">
                  {sampleNurse.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {sampleNurse.name}
                  </h1>
                </div>
                <Badge
                  className={
                    sampleNurse.isAvailable
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {sampleNurse.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={14} className="text-primary" />
                  <span>{sampleNurse.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={14} className="text-primary" />
                  <span>
                    {sampleLocation
                      ? `${sampleLocation} — ${sampleNurse.pincode}`
                      : `Pincode: ${sampleNurse.pincode}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <StarRating rating={4.5} size={16} />
                  <span className="text-sm text-muted-foreground ml-1">
                    (Sample reviews)
                  </span>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {sampleNurse.bio}
              </p>
              <a
                href={`tel:${sampleNurse.phone}`}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl call-btn font-semibold text-base transition-colors"
                data-ocid="nurse_profile.primary_button"
              >
                <Phone size={18} /> Call Now — {sampleNurse.phone}
              </a>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Patient Feedback
            </h2>
            <div className="space-y-3">
              {SAMPLE_FEEDBACK.slice(0, 3).map((fb, i) => (
                <SampleFeedbackCard key={fb.id} {...fb} index={i + 1} />
              ))}
            </div>
          </div>

          {/* Service Proof Gallery — sample nurse (empty for sample) */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Service Proof Gallery
            </h2>
            <div
              className="text-center py-10 bg-muted/40 rounded-xl"
              data-ocid="service_proof.empty_state"
            >
              <ImageIcon
                size={28}
                className="mx-auto text-muted-foreground mb-2"
              />
              <p className="text-muted-foreground text-sm">
                No service proofs uploaded yet.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!nurse) {
    return (
      <div
        className="container mx-auto px-4 py-16 text-center"
        data-ocid="nurse_profile.error_state"
      >
        <h2 className="text-xl font-bold text-foreground">Nurse not found</h2>
        <Button
          onClick={() =>
            navigate({ to: "/nurses", search: { pincode: undefined } })
          }
          className="mt-4"
          data-ocid="nurse_profile.link"
        >
          Back to Nurses
        </Button>
      </div>
    );
  }

  const initials = nurse.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const photoUrl = nurse.profilePhoto ? nurse.profilePhoto.getDirectURL() : "";

  const locationParts = [nurse.village, nurse.mandal, nurse.district]
    .filter(Boolean)
    .join(", ");
  const locationDisplay = locationParts
    ? `${locationParts} — ${nurse.pincode.toString()}`
    : `Pincode: ${nurse.pincode.toString()}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() =>
          navigate({ to: "/nurses", search: { pincode: undefined } })
        }
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        data-ocid="nurse_profile.link"
      >
        <ArrowLeft size={16} /> Back to Nurses
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0">
            <Avatar className="w-48 h-48 mx-auto md:mx-0 rounded-2xl">
              <AvatarImage
                src={photoUrl}
                alt={nurse.name}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {nurse.name}
                </h1>
              </div>
              <Badge
                className={
                  nurse.isAvailable
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }
              >
                {nurse.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} className="text-primary" />
                <span>{Number(nurse.experience)} years experience</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} className="text-primary" />
                <span>{locationDisplay}</span>
              </div>
              {aggregateRating != null && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="star-color fill-current" />
                  <span className="text-sm font-medium text-foreground">
                    {aggregateRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 5</span>
                </div>
              )}
            </div>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              {nurse.bio}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${nurse.phone}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl call-btn font-semibold text-base transition-colors"
                data-ocid="nurse_profile.primary_button"
              >
                <Phone size={18} /> Call Now — {nurse.phone}
              </a>

              <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-primary text-primary"
                    data-ocid="nurse_profile.open_modal_button"
                  >
                    <MessageSquarePlus size={16} /> Leave Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-md"
                  data-ocid="nurse_profile.dialog"
                >
                  <DialogHeader>
                    <DialogTitle>Leave Feedback for {nurse.name}</DialogTitle>
                  </DialogHeader>
                  <FeedbackForm
                    nurseId={nurse.id}
                    onSuccess={() => setFeedbackOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Feedback section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Patient Feedback
          </h2>
          {feedbackLoading ? (
            <div className="space-y-3" data-ocid="feedback.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : feedbackList && feedbackList.length > 0 ? (
            <div className="space-y-3">
              {feedbackList.map((fb, i) => (
                <FeedbackCard key={fb.id} feedback={fb} index={i + 1} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12 bg-muted/50 rounded-xl"
              data-ocid="feedback.empty_state"
            >
              <MessageSquarePlus
                size={32}
                className="mx-auto text-muted-foreground mb-2"
              />
              <p className="text-muted-foreground">
                No feedback yet. Be the first to share your experience!
              </p>
              <Button
                onClick={() => setFeedbackOpen(true)}
                variant="outline"
                className="mt-3 gap-2 border-primary text-primary"
                data-ocid="feedback.open_modal_button"
              >
                <MessageSquarePlus size={16} /> Leave Feedback
              </Button>
            </div>
          )}
        </div>

        {/* Service Proof Gallery */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Service Proof Gallery
          </h2>
          <ServiceProofGallery nurseId={nurse.id} />
        </div>
      </motion.div>
    </div>
  );
}
