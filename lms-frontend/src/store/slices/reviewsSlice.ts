import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { getErrorMessage } from '@/lib/api';
import {
  REVIEWS_ENDPOINT,
  REVIEWS_BY_COURSE_ENDPOINT,
  REVIEWS_COURSE_STATS_ENDPOINT,
  REVIEW_BY_UUID_ENDPOINT,
} from '@/constAPI';
import {
  Review,
  ReviewStats,
  PaginatedResponse,
  DetailResponse,
  MutationResponse,
  PaginationMeta,
} from '@/types';

interface ReviewsState {
  reviews: Review[];
  stats: ReviewStats | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  stats: null,
  pagination: null,
  loading: false,
  submitting: false,
  error: null,
};

export const fetchCourseReviews = createAsyncThunk<
  { data: Review[]; pagination: PaginationMeta },
  { courseUuid: string; page?: number; limit?: number },
  { rejectValue: string }
>('reviews/fetchByCourse', async ({ courseUuid, page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      REVIEWS_BY_COURSE_ENDPOINT(courseUuid),
      {
        params: { page, limit },
      },
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCourseStats = createAsyncThunk<
  ReviewStats,
  string,
  { rejectValue: string }
>('reviews/fetchStats', async (courseUuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<ReviewStats>>(
      REVIEWS_COURSE_STATS_ENDPOINT(courseUuid),
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createReview = createAsyncThunk<
  MutationResponse,
  { courseUuid: string; rating: number; comment?: string },
  { rejectValue: string }
>('reviews/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<MutationResponse>(REVIEWS_ENDPOINT, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateReview = createAsyncThunk<
  MutationResponse,
  { uuid: string; data: { rating?: number; comment?: string } },
  { rejectValue: string }
>('reviews/update', async ({ uuid, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch<MutationResponse>(REVIEW_BY_UUID_ENDPOINT(uuid), data);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteReview = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('reviews/delete', async (uuid, { rejectWithValue }) => {
  try {
    await apiClient.delete<MutationResponse>(REVIEW_BY_UUID_ENDPOINT(uuid));
    return uuid;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.stats = null;
    },
    clearReviewsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch reviews
    builder
      .addCase(fetchCourseReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCourseReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch reviews';
      });

    // Fetch stats
    builder
      .addCase(fetchCourseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Create review
    builder
      .addCase(createReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to submit review';
      });

    // Delete review
    builder.addCase(deleteReview.fulfilled, (state, action) => {
      state.reviews = state.reviews.filter((r) => r.uuid !== action.payload);
    });
  },
});

export const { clearReviews, clearReviewsError } = reviewsSlice.actions;
export default reviewsSlice.reducer;

