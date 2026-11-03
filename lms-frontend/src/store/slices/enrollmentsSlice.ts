import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { getErrorMessage } from '@/lib/api';
import {
  ENROLLMENTS_ENDPOINT,
  ENROLLMENTS_MY_COURSES_ENDPOINT,
  ENROLLMENTS_BY_COURSE_ENDPOINT,
  ENROLLMENT_STATUS_ENDPOINT,
} from '@/constAPI';
import { Enrollment, DetailResponse, MutationResponse, EnrollmentStatus } from '@/types';

interface EnrollmentsState {
  myEnrollments: Enrollment[];
  courseEnrollments: Enrollment[];
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentsState = {
  myEnrollments: [],
  courseEnrollments: [],
  loading: false,
  error: null,
};

export const fetchMyEnrollments = createAsyncThunk<
  Enrollment[],
  void,
  { rejectValue: string }
>('enrollments/fetchMyEnrollments', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<Enrollment[]>>(ENROLLMENTS_MY_COURSES_ENDPOINT);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCourseEnrollments = createAsyncThunk<
  Enrollment[],
  string,
  { rejectValue: string }
>('enrollments/fetchCourseEnrollments', async (courseUuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<Enrollment[]>>(
      ENROLLMENTS_BY_COURSE_ENDPOINT(courseUuid),
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const enrollCourse = createAsyncThunk<
  MutationResponse,
  string,
  { rejectValue: string }
>('enrollments/enroll', async (courseUuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<MutationResponse>(ENROLLMENTS_ENDPOINT, { courseUuid });
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateEnrollmentStatus = createAsyncThunk<
  MutationResponse,
  { uuid: string; status: EnrollmentStatus },
  { rejectValue: string }
>('enrollments/updateStatus', async ({ uuid, status }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch<MutationResponse>(ENROLLMENT_STATUS_ENDPOINT(uuid), {
      status,
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearEnrollmentsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // My enrollments
    builder
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.myEnrollments = action.payload;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch enrolled courses';
      });

    // Course enrollments
    builder
      .addCase(fetchCourseEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.courseEnrollments = action.payload;
      })
      .addCase(fetchCourseEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch enrollments for course';
      });

    // Enroll
    builder
      .addCase(enrollCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollCourse.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(enrollCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to enroll in course';
      });
  },
});

export const { clearEnrollmentsError } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;

