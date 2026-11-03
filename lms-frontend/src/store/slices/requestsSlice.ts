import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { getErrorMessage } from '@/lib/api';
import {
  REQUESTS_ENDPOINT,
  REQUESTS_MY_REQUESTS_ENDPOINT,
  REQUEST_TRACK_ENDPOINT,
  REQUEST_REVIEW_ENDPOINT,
} from '@/constAPI';
import {
  ChangeRequest,
  RequestType,
  RequestStatus,
  PaginatedResponse,
  DetailResponse,
  PaginationMeta,
} from '@/types';

interface RequestsState {
  myRequests: ChangeRequest[];
  allRequests: ChangeRequest[];
  trackedRequest: ChangeRequest | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  myRequests: [],
  allRequests: [],
  trackedRequest: null,
  pagination: null,
  loading: false,
  submitting: false,
  error: null,
};

export const submitChangeRequest = createAsyncThunk<
  ChangeRequest,
  { type: RequestType; reason: string; details?: Record<string, unknown> },
  { rejectValue: string }
>('requests/submit', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<DetailResponse<ChangeRequest>>(REQUESTS_ENDPOINT, payload);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMyRequests = createAsyncThunk<
  ChangeRequest[],
  void,
  { rejectValue: string }
>('requests/fetchMyRequests', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<PaginatedResponse<ChangeRequest>>(REQUESTS_MY_REQUESTS_ENDPOINT);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchRequestByNumber = createAsyncThunk<
  ChangeRequest,
  string,
  { rejectValue: string }
>('requests/trackByNumber', async (requestNumber, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<ChangeRequest>>(
      REQUEST_TRACK_ENDPOINT(requestNumber),
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAllRequests = createAsyncThunk<
  { data: ChangeRequest[]; pagination: PaginationMeta },
  { type?: RequestType; status?: RequestStatus; page?: number; limit?: number } | void,
  { rejectValue: string }
>('requests/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<PaginatedResponse<ChangeRequest>>(REQUESTS_ENDPOINT, {
      params: {
        type: params?.type,
        status: params?.status,
        page: params?.page || 1,
        limit: params?.limit || 20,
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

export const reviewChangeRequest = createAsyncThunk<
  ChangeRequest,
  { uuid: string; status: 'APPROVED' | 'REJECTED'; adminFeedback?: string },
  { rejectValue: string }
>('requests/review', async ({ uuid, status, adminFeedback }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch<DetailResponse<ChangeRequest>>(
      REQUEST_REVIEW_ENDPOINT(uuid),
      { status, adminFeedback },
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearTrackedRequest: (state) => {
      state.trackedRequest = null;
    },
    clearRequestsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Submit
    builder
      .addCase(submitChangeRequest.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitChangeRequest.fulfilled, (state, action) => {
        state.submitting = false;
        state.myRequests = [action.payload, ...state.myRequests];
        state.trackedRequest = action.payload;
      })
      .addCase(submitChangeRequest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to submit request';
      });

    // My requests
    builder
      .addCase(fetchMyRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch requests';
      });

    // Track by number
    builder
      .addCase(fetchRequestByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.trackedRequest = action.payload;
      })
      .addCase(fetchRequestByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Tracking number not found';
      });

    // All requests (admin)
    builder
      .addCase(fetchAllRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.allRequests = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load requests queue';
      });

    // Review request
    builder.addCase(reviewChangeRequest.fulfilled, (state, action) => {
      state.allRequests = state.allRequests.map((r) =>
        r.uuid === action.payload.uuid ? action.payload : r,
      );
      if (state.trackedRequest?.uuid === action.payload.uuid) {
        state.trackedRequest = action.payload;
      }
    });
  },
});

export const { clearTrackedRequest, clearRequestsError } = requestsSlice.actions;
export default requestsSlice.reducer;
