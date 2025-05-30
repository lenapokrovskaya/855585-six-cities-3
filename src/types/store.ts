import { TOffer } from './toffer';
import type {store} from '../store';
import { AuthorizationStatus } from '../const';


export type OffersState = {
  city: string;
  offers: TOffer[];
  authorizationStatus: AuthorizationStatus;
  isOffersDataLoading: boolean;
  error: string | null;
  email: string | null;
}
//автоматически выводит тип всего состояния (state), которое хранится в Redux-хранилище (store).
export type RootState = ReturnType<typeof store.getState>;

//получает тип dispatch-функции, которая используется для отправки (диспатча) экшенов в Redux.
export type AppDispatch = typeof store.dispatch;

