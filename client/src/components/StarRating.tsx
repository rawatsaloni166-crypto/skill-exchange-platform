interface StarRatingProps {
  rating: number;
  max?: number;
}

export default function StarRating({ rating, max = 5 }: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => {
    const filled = i + 1 <= Math.round(rating);
    return filled;
  });

  return (
    <span className="star-rating" aria-label={`${rating.toFixed(1)} out of ${max} stars`}>
      {stars.map((filled, i) => (
        <span key={i} className={filled ? 'star star-filled' : 'star star-empty'}>
          ★
        </span>
      ))}
      <span className="star-value">{rating.toFixed(1)}</span>
    </span>
  );
}
