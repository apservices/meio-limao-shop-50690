import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
  verified: boolean;
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const ReviewsSection = ({ reviews, averageRating, totalReviews }: ReviewsSectionProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-primary text-primary" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
          <div>
            <div className="flex">{renderStars(Math.round(averageRating))}</div>
            <p className="text-sm text-muted-foreground">{totalReviews} avaliações</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3 pb-6 border-b last:border-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.avatar} />
                  <AvatarFallback>{review.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.author}</span>
                    {review.verified && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-foreground">{review.comment}</p>
            
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-3">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Foto ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
