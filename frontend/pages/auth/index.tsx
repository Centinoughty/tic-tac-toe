import { AppDispatch } from "@/store";
import { loginAction } from "@/store/actions/authAction";
import { useRouter } from "next/router";
import { FormEvent } from "react";
import { useDispatch } from "react-redux";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const loginId = formData.get("loginId") as string;
    const password = formData.get("password") as string;

    dispatch(loginAction({ loginId, password }));
    router.push("/");
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input name="loginId" />
        <input name="password" />
        <button type="submit">Login</button>
      </form>
    </>
  );
}
