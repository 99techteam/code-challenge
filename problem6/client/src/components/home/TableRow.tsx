import { IUser } from "@/interfaces/models";
import styled, { css } from "styled-components";
import { Table } from "@/components/shared";
import { useSelector } from "react-redux";
import { getUser } from "@/slices/userSlice";

const UserName = styled.div<{ $isUser: boolean }>`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  font-family: "Sono";
  font-weight: 600;
  letter-spacing: 0.1px;
  ${(props) =>
    props.$isUser &&
    css`
      color: var(--color-primary);
    `}
`;

const UserEmail = styled.div<{ $isUser: boolean }>`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  font-family: "Sono";
  font-weight: 500;
  letter-spacing: 0.2px;
  ${(props) =>
    props.$isUser &&
    css`
      color: var(--color-primary);
    `}
`;

const DiscountPoint = styled.div<{ $isUser: boolean }>`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  font-family: "Sono";
  font-weight: 500;
  ${(props) =>
    props.$isUser &&
    css`
      color: var(--color-primary);
    `}
`;

interface IProps {
  user: IUser;
}

export default function TableRow({ user }: IProps) {
  const userInfo = useSelector(getUser);

  const isUser = user._id === userInfo.userId;

  return (
    <Table.Row>
      <UserName $isUser={isUser}>{user.user_name}</UserName>
      <UserEmail $isUser={isUser}>{user.user_email}</UserEmail>
      <DiscountPoint $isUser={isUser}>{user.user_point}</DiscountPoint>
    </Table.Row>
  );
}
