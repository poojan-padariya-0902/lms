import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { getErrorMessage } from '@/lib/api';
import {
  PROGRESS_MY_PROGRESS_ENDPOINT,
  PROGRESS_BY_COURSE_ENDPOINT,
  PROGRESS_LESSON_ENDPOINT,
} from '@/constAPI';
import { CourseProgressSummary, ProgressItem, DetailResponse, MutationResponse } from '@/types';

interface ProgressState {
  courseProgress: CourseProgressSummary | null;
  myProgressList: ProgressItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  courseProgress: null,
  myProgressList: [],
  loading: false,
  error: null,
};

export const fetchCourseProgress = createAsyncThunk<
  CourseProgressSummary,
  string,
  { rejectValue: string }
>('progress/fetchCourseProgress', async (courseUuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<CourseProgressSummary>>(
      PROGRESS_BY_COURSE_ENDPOINT(courseUuid),
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMyProgress = createAsyncThunk<
  ProgressItem[],
  void,
  { rejectValue: string }
>('progress/fetchMyProgress', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<ProgressItem[]>>(PROGRESS_MY_PROGRESS_ENDPOINT);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const toggleLessonProgress = createAsyncThunk<
  MutationResponse,
  { lessonUuid: string; isCompleted: boolean; courseUuid?: string },
  { rejectValue: string }
>('progress/toggleLesson', async ({ lessonUuid, isCompleted }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put<MutationResponse>(
      PROGRESS_LESSON_ENDPOINT(lessonUuid),
      { isCompleted },
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearCourseProgress: (state) => {
      state.courseProgress = null;
    },
    clearProgressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Course progress
    builder
      .addCase(fetchCourseProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.courseProgress = action.payload;
      })
      .addCase(fetchCourseProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch course progress';
      });

    // My progress
    builder
      .addCase(fetchMyProgress.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.myProgressList = action.payload;
      })
      .addCase(fetchMyProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch progress list';
      });
  },
});

export const { clearCourseProgress, clearProgressError } = progressSlice.actions;
export default progressSlice.reducer;

