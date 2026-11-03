'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { createReview, fetchCourseReviews, fetchCourseStats } from '@/store/slices/reviewsSlice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewModalProps {
  courseUuid: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({ courseUuid, isOpen, onClose }: ReviewModalProps) {
  const dispatch = useAppDispatch();
  const { submitting } = useAppSelector((state) => state.reviews);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a star rating');
      return;
    }

    try {
      const resultAction = await dispatch(
        createReview({
          courseUuid,
          rating,
          comment: comment.trim() || undefined,
        }),
      );

      if (createReview.fulfilled.match(resultAction)) {
        toast.success(resultAction.payload.message || 'Review submitted successfully!');
        dispatch(fetchCourseReviews({ courseUuid }));
        dispatch(fetchCourseStats(courseUuid));
        onClose();
        setComment('');
      } else {
        toast.error(resultAction.payload || 'Failed to submit review');
      }
    } catch {
      toast.error('An error occurred while submitting your review');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Course Review</DialogTitle>
          <DialogDescription>
            Share your feedback and learning experience with other students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2 text-center">
            <Label className="text-sm font-medium">Your Rating</Label>
            <div className="flex justify-center items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded-md transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-7 w-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {rating === 5 && 'Outstanding - Highly recommended!'}
              {rating === 4 && 'Very Good - Learned a lot!'}
              {rating === 3 && 'Average - Decent course.'}
              {rating === 2 && 'Below Average - Needs improvements.'}
              {rating === 1 && 'Poor - Did not meet expectations.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-comment">Written Review (Optional)</Label>
            <Textarea
              id="review-comment"
              placeholder="What did you like most about this course? How was the teaching style?"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewModal;

