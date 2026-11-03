import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { getErrorMessage } from '@/lib/api';
import { USERS_ENDPOINT, USER_BY_UUID_ENDPOINT } from '@/constAPI';
import { User, PaginatedResponse, DetailResponse, MutationResponse, PaginationMeta, Role } from '@/types';

interface UsersState {
  users: User[];
  currentUser: User | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  pagination: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<
  { data: User[]; pagination: PaginationMeta },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>('users/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<PaginatedResponse<User>>(USERS_ENDPOINT, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
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

export const fetchUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('users/fetchById', async (uuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<User>>(USER_BY_UUID_ENDPOINT(uuid));
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createUser = createAsyncThunk<
  MutationResponse,
  { name: string; email: string; password: string; role: Role },
  { rejectValue: string }
>('users/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<MutationResponse>(USERS_ENDPOINT, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateUser = createAsyncThunk<
  MutationResponse,
  { uuid: string; data: { name?: string; email?: string; role?: Role } },
  { rejectValue: string }
>('users/update', async ({ uuid, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch<MutationResponse>(USER_BY_UUID_ENDPOINT(uuid), data);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('users/delete', async (uuid, { rejectWithValue }) => {
  try {
    await apiClient.delete<MutationResponse>(USER_BY_UUID_ENDPOINT(uuid));
    return uuid;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      });

    // Fetch user by id
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user';
      });

    // Delete user
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.users = state.users.filter((u) => u.uuid !== action.payload);
    });
  },
});

export const { clearCurrentUser, clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;

