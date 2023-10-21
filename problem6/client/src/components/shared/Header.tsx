import styled from "styled-components";
import { BiLogInCircle, BiUser } from "react-icons/bi";
import { Link } from "react-router-dom";
import { PAGES_CONSTANT, VALUES_CONSTANT } from "@/constants";
import LogoWeb from "@/assets/LogoWeb.png";
import { deleteUser, getUser } from "@/slices/userSlice";
import { useSelector, useDispatch } from "react-redux";

const HeaderStyled = styled.nav`
  height: 8rem;
  background-color: var(--color-primary);
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  color: var(--color-white);
  z-index: 10;
`;

const Nav = styled.ul`
  width: 120rem;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NavItem = styled.li`
  a,
  .btn--logout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    cursor: pointer;

    .box--logo {
      width: 5rem;
      height: 5rem;
      img {
        object-fit: contain;
        object-position: center;
      }
    }

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

export default function Header() {
  const userAT = localStorage.getItem(
    VALUES_CONSTANT.LOCAL_STORE_NAME.AT_NAME_LOCAL_STORE
  );
  const user = useSelector(getUser);
  const dispatch = useDispatch();

  const handleClickLogout = () => {
    localStorage.removeItem(VALUES_CONSTANT.LOCAL_STORE_NAME.USER);
    localStorage.removeItem(
      VALUES_CONSTANT.LOCAL_STORE_NAME.AT_NAME_LOCAL_STORE
    );
    dispatch(deleteUser());
  };

  const isLogging = !!userAT || !!user.userId;

  const logo =
    LogoWeb ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyvt0lMGpXJvUhHtl6-TSMPfYKR-yno3nYwQ&usqp=CAU";

  return (
    <HeaderStyled>
      <Nav>
        <NavItem>
          <Link to={"/"}>
            <div className="box--logo">
              <img src={logo} alt="LogoWeb" />
            </div>
          </Link>
        </NavItem>
        <NavItem>
          {!isLogging ? (
            <Link to={PAGES_CONSTANT.login}>
              <BiLogInCircle />
              <span>Đăng nhập</span>
            </Link>
          ) : (
            <div onClick={handleClickLogout} className="btn--logout">
              <BiUser />
              <span>Đăng xuất</span>
            </div>
          )}
        </NavItem>
      </Nav>
    </HeaderStyled>
  );
}
