import { UseAuthApi } from "@/apis-use";
import { Button, Heading, Input, Spinner } from "@/components/shared";
import { PAGES_CONSTANT, VALUES_CONSTANT } from "@/constants";
import { IUser } from "@/interfaces/models";
import { IAuthLoginResultApi } from "@/interfaces/result-api/IResultAuthApi";
import { setUser } from "@/slices/userSlice";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useDispatch } from "react-redux";

const LoginLayoutStyled = styled.div`
  padding-top: 4rem;
  .heading {
    text-align: center;
  }
`;

const LoginFrom = styled.form`
  width: 60rem;
  margin: 2rem auto;
`;

const RegisterNow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  font-size: 1.4rem;
  & p {
    color: var(--color-grey-500);
    color: var(--color-text);
  }

  & a {
    color: var(--color-primary);
    font-weight: 600;
  }
`;

export default function LoginLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLogin, login } = UseAuthApi.login();
  const { register, formState, handleSubmit, watch } =
    useForm<Pick<IUser, "user_email" | "user_password">>();

  const onSubmit = (dataForm: Pick<IUser, "user_email" | "user_password">) => {
    login(dataForm, {
      onSuccess: (data: IAuthLoginResultApi) => {
        localStorage.setItem(
          VALUES_CONSTANT.LOCAL_STORE_NAME.AT_NAME_LOCAL_STORE,
          data.metadata.accessToken
        );
        localStorage.setItem(
          VALUES_CONSTANT.LOCAL_STORE_NAME.USER,
          JSON.stringify(data.metadata.user)
        );
        console.log("data.metadata:::", data.metadata.user);
        dispatch(
          setUser({
            userId: data.metadata.user._id,
            userName: data.metadata.user.user_name,
            userEmail: data.metadata.user.user_email,
            userPoint: data.metadata.user.user_point,
          })
        );
        navigate(PAGES_CONSTANT.home);
      },
    });
  };

  return (
    <LoginLayoutStyled>
      {isLogin && <Spinner />}
      <Heading $as="h3" className="heading">
        Đăng nhập
      </Heading>
      <LoginFrom onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          id="userName"
          hasValue={!!watch("user_email")}
          label="Email"
          register={register("user_email", {
            required: {
              value: true,
              message: "Vui lòng nhập email người dùng",
            },
            validate: (emailInput) => {
              if (!emailInput.match(VALUES_CONSTANT.REGEX_EMAIL))
                return "Email không hợp lệ";
            },
          })}
          error={formState.errors.user_email?.message}
        />
        <Input
          type="password"
          id="userPassword"
          hasValue={!!watch("user_password")}
          label="Password"
          register={register("user_password", {
            required: {
              value: true,
              message: "Vui lòng bổ sung mật khẩu",
            },
          })}
          error={formState.errors.user_password?.message}
        />
        <RegisterNow>
          <p>Bạn chưa có tài khoản?</p>
          <Link to={PAGES_CONSTANT.register}>Đăng ký ngay</Link>
        </RegisterNow>
        <Button
          disabled={isLogin}
          $variation={!isLogin ? "primary" : "secondary"}
        >
          {!isLogin ? <span>Đăng nhập</span> : <span>Đang đăng nhập</span>}
        </Button>
      </LoginFrom>
    </LoginLayoutStyled>
  );
}
