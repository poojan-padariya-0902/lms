import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { getErrorMessage } from '@/lib/api';
import {
  QUIZZES_ENDPOINT,
  QUIZZES_BY_COURSE_ENDPOINT,
  QUIZ_BY_UUID_ENDPOINT,
  QUIZ_SUBMIT_ENDPOINT,
  QUIZ_MY_SUBMISSIONS_ENDPOINT,
} from '@/constAPI';
import {
  Quiz,
  QuizSubmissionResult,
  Submission,
  DetailResponse,
  MutationResponse,
  QuizQuestion,
} from '@/types';

interface QuizzesState {
  currentQuiz: Quiz | null;
  lastSubmissionResult: QuizSubmissionResult | null;
  submissions: Submission[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: QuizzesState = {
  currentQuiz: null,
  lastSubmissionResult: null,
  submissions: [],
  loading: false,
  submitting: false,
  error: null,
};

export const fetchQuizByCourse = createAsyncThunk<
  Quiz | null,
  string,
  { rejectValue: string }
>('quizzes/fetchByCourse', async (courseUuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<Quiz>>(
      QUIZZES_BY_COURSE_ENDPOINT(courseUuid),
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchQuizById = createAsyncThunk<
  Quiz,
  string,
  { rejectValue: string }
>('quizzes/fetchById', async (uuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<Quiz>>(QUIZ_BY_UUID_ENDPOINT(uuid));
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const submitQuiz = createAsyncThunk<
  QuizSubmissionResult,
  { quizUuid: string; selectedAnswers: number[] },
  { rejectValue: string }
>('quizzes/submit', async ({ quizUuid, selectedAnswers }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<{
      success: boolean;
      statusCode: number;
      data: QuizSubmissionResult;
    }>(QUIZ_SUBMIT_ENDPOINT(quizUuid), { selectedAnswers });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMySubmissions = createAsyncThunk<
  Submission[],
  string,
  { rejectValue: string }
>('quizzes/fetchMySubmissions', async (quizUuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<Submission[]>>(
      QUIZ_MY_SUBMISSIONS_ENDPOINT(quizUuid),
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createQuiz = createAsyncThunk<
  MutationResponse,
  {
    title: string;
    description?: string;
    courseUuid: string;
    questions: QuizQuestion[];
    passingScorePercentage?: number;
  },
  { rejectValue: string }
>('quizzes/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<MutationResponse>(QUIZZES_ENDPOINT, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteQuiz = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('quizzes/delete', async (uuid, { rejectWithValue }) => {
  try {
    await apiClient.delete<MutationResponse>(QUIZ_BY_UUID_ENDPOINT(uuid));
    return uuid;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
    clearLastSubmissionResult: (state) => {
      state.lastSubmissionResult = null;
    },
    clearQuizzesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch quiz by course
    builder
      .addCase(fetchQuizByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizByCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch quiz';
      });

    // Fetch single
    builder
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch quiz';
      });

    // Submit quiz
    builder
      .addCase(submitQuiz.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.submitting = false;
        state.lastSubmissionResult = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Quiz submission failed';
      });

    // Submissions
    builder
      .addCase(fetchMySubmissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch submissions';
      });
  },
});

export const { clearCurrentQuiz, clearLastSubmissionResult, clearQuizzesError } =
  quizzesSlice.actions;
export default quizzesSlice.reducer;

