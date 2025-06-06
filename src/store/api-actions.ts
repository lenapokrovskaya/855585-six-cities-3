import axios from 'axios';
import { AxiosInstance } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, OffersState } from '../types/store';
import { ShortOfferType, FullOfferType } from '../types/toffer';
import { ReviewType } from '../types/treview';
import { CommentPostType } from '../types/comment';
import { loadOffers, loadOffer, loadNearbyOffers, loadOfferComments, requireAuthorization, setError, setOffersDataLoadingStatus, setOfferDataLoadingStatus, redirectToRoute, setUserEmail } from './actions';
import { saveToken, dropToken } from '../services/token';
import { APIRoute, AuthorizationStatus, TIMEOUT_SHOW_ERROR, AppRoute } from '../const';
import { AuthData } from '../types/auth-data';
import { UserData } from '../types/user-data';
import { store } from './';

export const clearErrorAction = createAsyncThunk(
  'app/clearError',
  () => {
    setTimeout(
      () => store.dispatch(setError(null)),
      TIMEOUT_SHOW_ERROR
    );
  }
);

//Действие которое отправляет GET-запрос, создаем новый AsyncThunk
export const fetchOffersAction = createAsyncThunk<
  void,//Тип возвращаемого значения (ничего не возвращает — void)
  undefined,//Тип аргумента, который принимает (в этом случае — ничего)
  {
    dispatch: AppDispatch;//Тип функции dispatch, которую можно использовать внутри thunk
    state: OffersState; //Типизация состояния (если нужно внутри получить state)
    extra: AxiosInstance;//Прокинутый экземпляр axios, используемый для HTTP-запросов
  }
>(
  'data/fetchOffers',//Имя экшена (префикс в типах 'data/fetchOffers', 'fulfilled', 'rejected')

  //Сам асинхронный thunk
  async (_arg, { dispatch, extra: api }) => {//_arg = undefined + извлекаем из объекта эл-ты для ас-й операции
    try {
      dispatch(setOffersDataLoadingStatus(true));
      //Делаем GET-запрос к API, чтобы получить список предложений (offers)
      const { data } = await api.get<ShortOfferType[]>(APIRoute.Offers);
      dispatch(setOffersDataLoadingStatus(false));
      //После успешного получения данных отправляем их в store с помощью экшена
      dispatch(loadOffers(data));
    } catch(error) {
      dispatch(setError('Не удалось загрузить данные'));
    }
  }
);

export const fetchOfferAction = createAsyncThunk<
  void,
  string,
  {
    dispatch: AppDispatch;
    state: OffersState;
    extra: AxiosInstance;
  }
>(
  'data/fetchOffer',
  async (id, { dispatch, extra: api }) => {
    try {
      dispatch(loadOffer(null));
      dispatch(setOfferDataLoadingStatus(true));
      const { data } = await api.get<FullOfferType>(`${APIRoute.Offers}/${id}`);
      dispatch(loadOffer(data));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        dispatch(redirectToRoute(AppRoute.NotFound));
      } else {
        dispatch(setError('Не удалось загрузить оффер'));
      }
    } finally {
      dispatch(setOfferDataLoadingStatus(false));
    }
  }
);

//Действие которое отправляет GET-запрос на получение офферов неподалеку
export const fetchNearbyOffersAction = createAsyncThunk<
  void,
  string,
  {
    dispatch: AppDispatch;
    state: OffersState;
    extra: AxiosInstance;
  }
>(
  'data/fetchOffersNearby',

  async (id, { dispatch, extra: api }) => {
    try {
      dispatch(setOfferDataLoadingStatus(true));
      const { data } = await api.get<ShortOfferType[]>(`${APIRoute.Offers}/${id}/nearby`);
      dispatch(setOfferDataLoadingStatus(false));
      dispatch(loadNearbyOffers(data));
    } catch(error) {
      dispatch(setError('Не удалось загрузить предложения неподалеку'));
    }
  }
);

//Действие которое отправляет GET-запрос на получение комментов к офферу
export const fetchOfferCommentsAction = createAsyncThunk<
  void,
  string,
  {
    dispatch: AppDispatch;
    state: OffersState;
    extra: AxiosInstance;
  }
>(
  'data/fetchOfferComments',

  async (id, { dispatch, extra: api }) => {
    try {
      dispatch(setOfferDataLoadingStatus(true));
      const { data } = await api.get<ReviewType[]>(`${APIRoute.Comments}/${id}`);
      dispatch(setOfferDataLoadingStatus(false));
      dispatch(loadOfferComments(data));
    } catch(error) {
      dispatch(setError('Не удалось загрузить комментарии'));
    }
  }
);

//Действие которое отправляет коммент к офферу
export const addOfferCommentAction = createAsyncThunk<
  void,
  CommentPostType,
  {
    dispatch: AppDispatch;
    state: OffersState;
    extra: AxiosInstance;
  }
>(
  'data/addOfferComment',
  async ({ id, comment, rating }, { dispatch, extra: api }) => {
    try {
      await api.post<CommentPostType>(`${APIRoute.Comments}/${id}`, {
        comment,
        rating,
      });
      const { data } = await api.get<ReviewType[]>(`${APIRoute.Comments}/${id}`);
      dispatch(loadOfferComments(data));
    } catch (error) {
      dispatch(setError('Не удалось оставить комментарий'));
    }
  }
);

//асинхронный экшен проверяет, авторизован ли пользователь, отправляя GET-запрос к эндпоинту /login.
// В зависимости от ответа, он диспатчит один из двух экшенов: Auth или NoAuth.
export const checkAuthAction = createAsyncThunk<void, undefined, {
  dispatch: AppDispatch;
  state: OffersState;
  extra: AxiosInstance;
}>(
  'user/checkAuth',
  async (_arg, { dispatch, extra: api }) => {
    try {
      await api.get(APIRoute.Login);// Пытаемся получить данные по маршруту /login
      dispatch(requireAuthorization(AuthorizationStatus.Auth));//Cтатус "авторизован"
    } catch {
      dispatch(requireAuthorization(AuthorizationStatus.NoAuth));//В случае ошибки — статус "не авторизован"
    }
  },
);

// Создаём асинхронный thunk-экшен для логина пользователя
export const loginAction = createAsyncThunk<
  void,
  AuthData,//Тип входных данных: логин и пароль
  {
    dispatch: AppDispatch;
    state: OffersState;
    extra: AxiosInstance;
  }
>(
  'user/login',


  async ({ login: email, password }, { dispatch, extra: api }) => {
    try {
      //Отправляем POST-запрос на эндпоинт логина с email и паролем
      const { data } = await api.post<UserData>(APIRoute.Login, { email, password });

      // Сохраняем токен
      saveToken(data.token);

      // Обновляем состояние
      dispatch(requireAuthorization(AuthorizationStatus.Auth));
      dispatch(setUserEmail(data.email));
      dispatch(redirectToRoute(AppRoute.Main));
    } catch (error) {
      // Отправляем ошибку в Redux-хранилище
      dispatch(setError('Неверный логин или пароль.'));

      // Через несколько секунд очищаем сообщение об ошибке
      setTimeout(() => dispatch(setError(null)), TIMEOUT_SHOW_ERROR);
      throw error;
    }
  },
);

// Создаём асинхронный thunk-действие для выхода пользователя из системы
export const logoutAction = createAsyncThunk<
  void,
  undefined,
  {
    dispatch: AppDispatch;
    state: OffersState;
    extra: AxiosInstance;
  }
>(
  'user/logout',// Уникальный идентификатор действия (используется для генерации типов и логов)
  async (_arg, { dispatch, extra: api }) => {
    try{
      // Отправляем DELETE-запрос на сервер, чтобы завершить сессию пользователя
      await api.delete(APIRoute.Logout);
      // Удаляем токен из localStorage, чтобы "разлогинить" пользователя локально
      dropToken();
      // Обновляем статус авторизации в Redux-состоянии на "не авторизован"
      dispatch(requireAuthorization(AuthorizationStatus.NoAuth));
    } catch(error) {
      dispatch(setError('Не удалось разлогиниться'));
      setTimeout(() => dispatch(setError(null)), TIMEOUT_SHOW_ERROR);
      throw error;
    }
  }
);

