import { VALUES_CONSTANT } from "@/constants";
import { ILocalStoreUser } from "@/interfaces/local-store";
import { createSlice } from "@reduxjs/toolkit";
interface IInitialState {
  userId: string;
  userName: string;
  userEmail: string;
  userPoint: number;
}
const initializeStateFromLocalStorage = (): IInitialState => {
  const dataStorage = localStorage.getItem(
    VALUES_CONSTANT.LOCAL_STORE_NAME.USER
  );
  if (!dataStorage)
    return {
      userId: "",
      userName: "",
      userEmail: "",
      userPoint: 0,
    };
  const { userId, userName, userEmail, userPoint } = JSON.parse(
    dataStorage
  ) as ILocalStoreUser;

  return {
    userId,
    userName,
    userEmail,
    userPoint,
  };
};

const initialState: IInitialState = initializeStateFromLocalStorage();

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: { payload: IInitialState }) {
      console.log("Set user");
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.userEmail = action.payload.userEmail;
      state.userPoint = action.payload.userPoint;
    },
    deleteUser(state) {
      state.userId = "";
      state.userName = "";
      state.userEmail = "";
      state.userPoint = 0;
    },
  },
});

export const { setUser, deleteUser } = userSlice.actions;

export const getUser = (state: { user: IInitialState }) => state.user;

export default userSlice.reducer;
