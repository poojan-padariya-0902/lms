import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { getErrorMessage } from '@/lib/api';
import { CATEGORIES_ENDPOINT, CATEGORY_BY_UUID_ENDPOINT } from '@/constAPI';
import { Category, PaginatedResponse, DetailResponse, MutationResponse } from '@/types';

interface CategoriesState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk<
  Category[],
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>('categories/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<PaginatedResponse<Category>>(CATEGORIES_ENDPOINT, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCategoryById = createAsyncThunk<
  Category,
  string,
  { rejectValue: string }
>('categories/fetchById', async (uuid, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<DetailResponse<Category>>(CATEGORY_BY_UUID_ENDPOINT(uuid));
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createCategory = createAsyncThunk<
  MutationResponse,
  { name: string; description?: string },
  { rejectValue: string }
>('categories/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<MutationResponse>(CATEGORIES_ENDPOINT, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateCategory = createAsyncThunk<
  MutationResponse,
  { uuid: string; data: { name?: string; description?: string } },
  { rejectValue: string }
>('categories/update', async ({ uuid, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch<MutationResponse>(CATEGORY_BY_UUID_ENDPOINT(uuid), data);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('categories/delete', async (uuid, { rejectWithValue }) => {
  try {
    await apiClient.delete<MutationResponse>(CATEGORY_BY_UUID_ENDPOINT(uuid));
    return uuid;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearCategoriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch categories';
      });

    // Fetch by id
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch category';
      });

    // Delete
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.categories = state.categories.filter((cat) => cat.uuid !== action.payload);
    });
  },
});

export const { clearCurrentCategory, clearCategoriesError } = categoriesSlice.actions;
export default categoriesSlice.reducer;

