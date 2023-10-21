import { UseAuthApi } from "@/apis-use";
import { Button, Heading, Input } from "@/components/shared";
import { PAGES_CONSTANT, VALUES_CONSTANT } from "@/constants";
import { IUser } from "@/interfaces/models";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

const RegisterLayoutStyled = styled.div`
  padding-top: 4rem;
  .heading {
    text-align: center;
  }
`;

const RegisterFrom = styled.form`
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

export default function RegisterLayout() {
  const navigate = useNavigate();
  const { isRegistering, register: registerAuth } = UseAuthApi.register();
  const { register, formState, handleSubmit, watch } =
    useForm<Pick<IUser, "user_name" | "user_email" | "user_password">>();

  const onSubmit = (
    dataForm: Pick<IUser, "user_name" | "user_email" | "user_password">
  ) => {
    registerAuth(dataForm, {
      onSuccess: (data) => {
        navigate("/login");
      },
    });
  };

  return (
    <RegisterLayoutStyled>
      <Heading $as="h3" className="heading">
        Đăng ký
      </Heading>
      <RegisterFrom onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          id="userName"
          hasValue={!!watch("user_name")}
          label="Tên người dùng"
          register={register("user_name", {
            required: {
              value: true,
              message: "Vui lòng bổ sung tên người dùng",
            },
          })}
          error={formState.errors.user_name?.message}
        />
        <Input
          type="text"
          id="userEmail"
          hasValue={!!watch("user_email")}
          label="Email"
          register={register("user_email", {
            required: {
              value: true,
              message: "Vui lòng bổ sung email người dùng",
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
          <p>Bạn đã có tài khoản?</p>
          <Link to={PAGES_CONSTANT.login}>Đăng nhập ngay</Link>
        </RegisterNow>
        <Button
          disabled={isRegistering}
          $variation={!isRegistering ? "primary" : "secondary"}
        >
          {!isRegistering ? <span>Đăng ký</span> : <span>Đang đăng ký</span>}
        </Button>
      </RegisterFrom>
    </RegisterLayoutStyled>
  );
}
