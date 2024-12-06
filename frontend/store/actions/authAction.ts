import { AppDispatch } from "..";
import { setUser } from "../reducers/authSlice";

export const loginAction = (req: any) => async (dispatch: AppDispatch) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      }
    );

    const resData = await response.json();

    if (response.ok) {
      dispatch(setUser({ token: resData.token }));
    }
  } catch (error) {}
};
