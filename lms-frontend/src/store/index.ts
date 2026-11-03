import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import coursesReducer from './slices/coursesSlice';
import categoriesReducer from './slices/categoriesSlice';
import lessonsReducer from './slices/lessonsSlice';
import enrollmentsReducer from './slices/enrollmentsSlice';
import progressReducer from './slices/progressSlice';
import quizzesReducer from './slices/quizzesSlice';
import reviewsReducer from './slices/reviewsSlice';
import usersReducer from './slices/usersSlice';
import requestsReducer from './slices/requestsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    categories: categoriesReducer,
    lessons: lessonsReducer,
    enrollments: enrollmentsReducer,
    progress: progressReducer,
    quizzes: quizzesReducer,
    reviews: reviewsReducer,
    users: usersReducer,
    requests: requestsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
