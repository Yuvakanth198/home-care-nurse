import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useSubmitFeedback } from "../hooks/useQueries";
import { v4 as uuidv4 } from "../utils/uuid";
import { StarRating } from "./StarRating";

interface FeedbackFormProps {
  nurseId: string;
  onSuccess?: () => void;
}

interface FileEntry {
  file: File;
  uid: string;
}

export function FeedbackForm({ nurseId, onSuccess }: FeedbackFormProps) {
  const [patientName, setPatientName] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [mediaEntries, setMediaEntries] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);

  const submitFeedback = useSubmitFeedback();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const entries = files.map((file) => ({ file, uid: uuidv4() }));
    setMediaEntries((prev) => [...prev, ...entries]);
  };

  const removeFile = (uid: string) => {
    setMediaEntries((prev) => prev.filter((e) => e.uid !== uid));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review.");
      return;
    }

    setUploading(true);
    try {
      const mediaBlobs: ExternalBlob[] = [];
      for (const entry of mediaEntries) {
        const bytes = new Uint8Array(await entry.file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        mediaBlobs.push(blob);
      }

      await submitFeedback.mutateAsync({
        id: uuidv4(),
        nurseId,
        patientName: patientName.trim(),
        rating: BigInt(rating),
        reviewText: reviewText.trim(),
        mediaUrls: mediaBlobs,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });

      toast.success("Thank you! Your feedback has been submitted.");
      setPatientName("");
      setRating(0);
      setReviewText("");
      setMediaEntries([]);
      onSuccess?.();
    } catch (err) {
      toast.error("Failed to submit feedback. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="feedback.modal"
    >
      <div>
        <Label htmlFor="patient-name" className="text-sm font-medium">
          Your Name
        </Label>
        <Input
          id="patient-name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Enter your full name"
          className="mt-1"
          data-ocid="feedback.input"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Rating</Label>
        <div className="mt-2" data-ocid="feedback.select">
          <StarRating
            rating={rating}
            interactive
            onChange={setRating}
            size={28}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="review" className="text-sm font-medium">
          Review
        </Label>
        <Textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this nurse..."
          rows={4}
          className="mt-1"
          data-ocid="feedback.textarea"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">
          Upload Photos / Videos (optional)
        </Label>
        <label
          htmlFor="media-upload"
          className="mt-2 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
          data-ocid="feedback.upload_button"
        >
          <Upload size={20} className="text-muted-foreground mb-1" />
          <span className="text-sm text-muted-foreground">
            Click to upload photos or videos
          </span>
          <input
            id="media-upload"
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {mediaEntries.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {mediaEntries.map((entry) => (
              <div
                key={entry.uid}
                className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm"
              >
                <span className="max-w-[120px] truncate">
                  {entry.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(entry.uid)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={uploading || submitFeedback.isPending}
        className="w-full bg-primary text-primary-foreground"
        data-ocid="feedback.submit_button"
      >
        {uploading || submitFeedback.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Feedback"
        )}
      </Button>
    </form>
  );
}
