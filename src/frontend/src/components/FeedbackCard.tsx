import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Feedback } from "../backend";
import { StarRating } from "./StarRating";

interface FeedbackCardProps {
  feedback: Feedback;
  index?: number;
}

export function FeedbackCard({ feedback, index = 1 }: FeedbackCardProps) {
  const initials = feedback.patientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const date = new Date(Number(feedback.createdAt) / 1_000_000);
  const dateStr = date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className="card-shadow border-border"
      data-ocid={`feedback.item.${index}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold text-foreground">
                {feedback.patientName}
              </span>
              <span className="text-xs text-muted-foreground">{dateStr}</span>
            </div>
            <StarRating rating={Number(feedback.rating)} size={14} />
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {feedback.reviewText}
            </p>
            {feedback.mediaUrls && feedback.mediaUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {feedback.mediaUrls.map((media, i) => {
                  const url = media.getDirectURL();
                  const isVideo =
                    url.includes("video") ||
                    url.endsWith(".mp4") ||
                    url.endsWith(".webm");
                  const key = `${feedback.id}-media-${i}`;
                  return isVideo ? (
                    // biome-ignore lint/a11y/useMediaCaption: treatment video clips
                    <video
                      key={key}
                      src={url}
                      controls
                      className="w-32 h-24 rounded object-cover"
                    />
                  ) : (
                    <img
                      key={key}
                      src={url}
                      alt={`Treatment result ${i + 1}`}
                      className="w-24 h-24 rounded object-cover border border-border"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SampleFeedbackCardProps {
  patientName: string;
  rating: number;
  reviewText: string;
  initials: string;
  index?: number;
}

export function SampleFeedbackCard({
  patientName,
  rating,
  reviewText,
  initials,
  index = 1,
}: SampleFeedbackCardProps) {
  return (
    <Card
      className="card-shadow border-border"
      data-ocid={`feedback.item.${index}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-foreground">{patientName}</span>
            <StarRating rating={rating} size={14} />
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {reviewText}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
