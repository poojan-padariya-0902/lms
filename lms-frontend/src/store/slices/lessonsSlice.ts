import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { getErrorMessage } from '@/lib/api';
import {
  LESSONS_ENDPOINT,
  LESSONS_BY_COURSE_ENDPOINT,
  LESSON_BY_UUID_ENDPOINT,
} from '@/constAPI';
import { Lesson, DetailResponse, MutationResponse } from '@/types';

interface LessonsState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  loading: boolean;
  error: string | null;
}

const initialState: LessonsState = {
  lessons: [],
  currentLesson: null,
  loading: false,
  error: null,
};

export const fetchLessonsByCourse = createAsyncThunk<
  Lesson[],
  string,
  { rejectValue: string }
>('lessons/fetchByCourse', async (courseUuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<Lesson[]>>(
      LESSONS_BY_COURSE_ENDPOINT(courseUuid),
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchLessonById = createAsyncThunk<
  Lesson,
  string,
  { rejectValue: string }
>('lessons/fetchById', async (uuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<Lesson>>(LESSON_BY_UUID_ENDPOINT(uuid));
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createLesson = createAsyncThunk<
  MutationResponse,
  {
    title: string;
    content?: string;
    videoUrl?: string;
    durationMinutes: number;
    order: number;
    isFreePreview?: boolean;
    courseUuid: string;
  },
  { rejectValue: string }
>('lessons/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<MutationResponse>(LESSONS_ENDPOINT, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateLesson = createAsyncThunk<
  MutationResponse,
  {
    uuid: string;
    data: {
      title?: string;
      content?: string;
      videoUrl?: string;
      durationMinutes?: number;
      order?: number;
      isFreePreview?: boolean;
    };
  },
  { rejectValue: string }
>('lessons/update', async ({ uuid, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch<MutationResponse>(LESSON_BY_UUID_ENDPOINT(uuid), data);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteLesson = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('lessons/delete', async (uuid, { rejectWithValue }) => {
  try {
    await apiClient.delete<MutationResponse>(LESSON_BY_UUID_ENDPOINT(uuid));
    return uuid;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    setCurrentLesson: (state, action) => {
      state.currentLesson = action.payload;
    },
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
    },
    clearLessonsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch by course
    builder
      .addCase(fetchLessonsByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonsByCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.lessons = action.payload;
        if (action.payload.length > 0 && !state.currentLesson) {
          state.currentLesson = action.payload[0];
        }
      })
      .addCase(fetchLessonsByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch lessons';
      });

    // Fetch single
    builder
      .addCase(fetchLessonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch lesson';
      });

    // Delete
    builder.addCase(deleteLesson.fulfilled, (state, action) => {
      state.lessons = state.lessons.filter((l) => l.uuid !== action.payload);
      if (state.currentLesson?.uuid === action.payload) {
        state.currentLesson = state.lessons[0] || null;
      }
    });
  },
});

export const { setCurrentLesson, clearCurrentLesson, clearLessonsError } = lessonsSlice.actions;
export default lessonsSlice.reducer;

