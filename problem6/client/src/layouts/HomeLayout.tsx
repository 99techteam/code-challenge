import { UseUserApi } from "@/apis-use";
import { TableRow } from "@/components/home";
import { Button, Heading, Spinner, Table } from "@/components/shared";
import { PAGES_CONSTANT, VALUES_CONSTANT } from "@/constants";
import { IUser } from "@/interfaces/models";
import { getUser } from "@/slices/userSlice";
import { randomKey } from "@/utils";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const HomeLayoutStyled = styled.div`
  padding: 2rem 0;

  .heading {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1rem;
    box-shadow: var(--shadow-around);
    border-radius: 2rem;
  }

  .btn {
    margin-top: 2rem;
  }
`;

export default function HomeLayout() {
  const navigate = useNavigate();
  const { isGettingAllUsers, metadata } = UseUserApi.getAllUsers();
  const user = useSelector(getUser);
  const userAT = localStorage.getItem(
    VALUES_CONSTANT.LOCAL_STORE_NAME.AT_NAME_LOCAL_STORE
  );

  if (isGettingAllUsers) return <Spinner />;

  const isLogging = !!user.userId || !!userAT;
  
  const handleClickBtn = () => {
    if (!isLogging) return navigate(PAGES_CONSTANT.login);
    navigate(PAGES_CONSTANT.challenge);
  };

  return (
    <HomeLayoutStyled>
      <Heading $as="h2" className="heading">
        Bảng điểm xếp hạng người dùng
      </Heading>
      <Table columns=" 1fr 1fr 0.5fr">
        <Table.Header>
          <p>UserName</p>
          <p>UserEmail</p>
          <p>UserPoint</p>
        </Table.Header>
        <Table.Body
          data={metadata}
          render={(user: IUser) => (
            <TableRow user={user} key={user._id || randomKey()} />
          )}
        />
      </Table>
      <Button className="btn" onClick={handleClickBtn}>
        Tham gia thử thách nâng hạng
      </Button>
    </HomeLayoutStyled>
  );
}
