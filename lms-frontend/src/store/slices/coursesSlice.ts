import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { getErrorMessage } from '@/lib/api';
import {
  COURSES_ENDPOINT,
  COURSES_BY_CATEGORY_ENDPOINT,
  COURSE_BY_UUID_ENDPOINT,
  COURSES_INSTRUCTOR_MY_COURSES_ENDPOINT,
} from '@/constAPI';
import { Course, PaginatedResponse, DetailResponse, MutationResponse, PaginationMeta } from '@/types';

interface CoursesState {
  courses: Course[];
  currentCourse: Course | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  courses: [],
  currentCourse: null,
  pagination: null,
  loading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk<
  { data: Course[]; pagination: PaginationMeta },
  { page?: number; limit?: number; search?: string } | void,
  { rejectValue: string }
>('courses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<PaginatedResponse<Course>>(COURSES_ENDPOINT, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search,
      },
    });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCoursesByCategory = createAsyncThunk<
  { data: Course[]; pagination: PaginationMeta },
  { categoryUuid: string; page?: number; limit?: number },
  { rejectValue: string }
>('courses/fetchByCategory', async ({ categoryUuid, page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<PaginatedResponse<Course>>(
      COURSES_BY_CATEGORY_ENDPOINT(categoryUuid),
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

export const fetchInstructorCourses = createAsyncThunk<
  { data: Course[]; pagination: PaginationMeta },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>('courses/fetchInstructorCourses', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<PaginatedResponse<Course>>(
      COURSES_INSTRUCTOR_MY_COURSES_ENDPOINT,
      {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 100,
        },
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

export const fetchCourseById = createAsyncThunk<
  Course,
  string,
  { rejectValue: string }
>('courses/fetchById', async (uuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<Course>>(COURSE_BY_UUID_ENDPOINT(uuid));
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createCourse = createAsyncThunk<
  MutationResponse,
  { title: string; description: string; price: number; categoryUuid: string },
  { rejectValue: string }
>('courses/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<MutationResponse>(COURSES_ENDPOINT, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateCourse = createAsyncThunk<
  MutationResponse,
  { uuid: string; data: { title?: string; description?: string; price?: number; categoryUuid?: string } },
  { rejectValue: string }
>('courses/update', async ({ uuid, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch<MutationResponse>(COURSE_BY_UUID_ENDPOINT(uuid), data);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteCourse = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('courses/delete', async (uuid, { rejectWithValue }) => {
  try {
    await apiClient.delete<MutationResponse>(COURSE_BY_UUID_ENDPOINT(uuid));
    return uuid;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearCoursesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch courses';
      });

    // Fetch by category
    builder
      .addCase(fetchCoursesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCoursesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch courses by category';
      });

    // Fetch instructor courses
    builder
      .addCase(fetchInstructorCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInstructorCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch instructor courses';
      });

    // Fetch single
    builder
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch course';
      });

    // Delete
    builder.addCase(deleteCourse.fulfilled, (state, action) => {
      state.courses = state.courses.filter((course) => course.uuid !== action.payload);
      if (state.currentCourse?.uuid === action.payload) {
        state.currentCourse = null;
      }
    });
  },
});

export const { clearCurrentCourse, clearCoursesError } = coursesSlice.actions;
export default coursesSlice.reducer;

