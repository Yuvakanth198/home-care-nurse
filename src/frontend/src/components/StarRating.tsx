import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  max = 5,
  size = 18,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const starNums = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className="flex gap-0.5">
      {starNums.map((starNum) => (
        <button
          key={`star-${starNum}`}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(starNum)}
          className={
            interactive
              ? "cursor-pointer transition-transform hover:scale-110"
              : "cursor-default"
          }
          aria-label={interactive ? `Rate ${starNum} stars` : undefined}
        >
          <Star
            size={size}
            className={
              starNum <= rating
                ? "star-color fill-current"
                : "text-muted-foreground"
            }
          />
        </button>
      ))}
    </div>
  );
}
