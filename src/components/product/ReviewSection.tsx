'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils';

type Review = {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { name: string | null; image: string | null };
};

type Props = {
    productId: string;
    reviews: Review[];
    rating: number;
    reviewCount: number;
};

export default function ReviewSection({ productId, reviews, rating, reviewCount }: Props) {
    const { data: session } = useSession();
    const [newRating, setNewRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localReviews, setLocalReviews] = useState(reviews);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            toast.error('Please sign in to leave a review');
            return;
        }
        if (comment.length < 10) {
            toast.error('Review must be at least 10 characters');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating: newRating, comment }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Review submitted!');
                setLocalReviews([data.review, ...localReviews]);
                setComment('');
                setNewRating(5);
            } else {
                toast.error(data.error || 'Failed to submit review');
            }
        } catch {
            toast.error('Failed to submit review');
        }
        setSubmitting(false);
    };

    return (
        <section className="mt-16 pt-16 border-t border-charcoal-100">
            <h2 className="section-title text-2xl mb-8">
                Customer Reviews ({reviewCount})
            </h2>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Rating Summary */}
                <div className="card p-6">
                    <div className="text-center mb-6">
                        <p className="text-5xl font-bold text-charcoal-900">{rating.toFixed(1)}</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(rating)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'fill-charcoal-200 text-charcoal-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-charcoal-500 mt-1">
                            Based on {reviewCount} reviews
                        </p>
                    </div>

                    {/* Write Review */}
                    {session && (
                        <form onSubmit={handleSubmit} className="border-t border-charcoal-100 pt-6">
                            <h3 className="text-sm font-semibold text-charcoal-900 mb-3">Write a Review</h3>
                            <div className="flex items-center gap-1 mb-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setNewRating(i + 1)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-6 h-6 cursor-pointer transition-colors ${i < newRating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'fill-charcoal-200 text-charcoal-200 hover:fill-amber-300 hover:text-amber-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                rows={4}
                                className="input-field mb-3 resize-none"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full text-sm disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                    {localReviews.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-charcoal-500">No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        localReviews.map((review) => (
                            <div key={review.id} className="card p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-charcoal-900">
                                                {review.user.name || 'Anonymous'}
                                            </p>
                                            <p className="text-xs text-charcoal-500">
                                                {formatDate(review.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'fill-charcoal-200 text-charcoal-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-charcoal-600 leading-relaxed">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
