import { useState } from "react";
import styled from "styled-components";
import { Button, Heading, Input, Spinner } from "@/components/shared";
import { getRandomNumber, getRandomOperator } from "@/utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PAGES_CONSTANT } from "@/constants";
import { UseUserApi } from "@/apis-use";
import { IUser } from "@/interfaces/models";
import { useSelector } from "react-redux";
import { getUser } from "@/slices/userSlice";

const ChallengeLayoutStyled = styled.div`
  position: relative;
  margin-top: 20rem;
  box-shadow: var(--shadow-around);
  padding: 4rem;
  border-radius: 2rem;

  .heading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    &--point {
      color: var(--color-primary);
    }
  }

  .btn--home {
    position: absolute;
    top: 2rem;
    right: 2rem;
    width: fit-content;
  }
`;

const BoxQuestion = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 2rem 0;

  .input {
    width: 20rem;
    border-radius: 5px;
    margin-top: 1rem;
    padding: 4px 1rem;
    outline: none;
  }
`;

export default function ChallengeLayout() {
  const navigate = useNavigate();
  const [point, setPoint] = useState<number>(0);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [firstValue, setFirstValue] = useState<number>(
    getRandomNumber(1, 100000)
  );
  const [secondValue, setSecondValue] = useState<number>(
    getRandomNumber(1, 100000)
  );
  const [valueAnswer, setValueAnswer] = useState<number>(0);
  const [operator, setOperator] = useState<string>(getRandomOperator());

  const { isUpdatingPoint, updatePoint } = UseUserApi.updatePoint();

  const handleAnswerQuestion = () => {
    let result: number = 0;
    switch (operator) {
      case "+":
        result = firstValue + secondValue;
        break;
      case "-":
        result = firstValue - secondValue;
        break;
      case "*":
        result = firstValue * secondValue;
        break;
      default:
        break;
    }
    if (result !== valueAnswer) {
      toast.error(`Bạn đã trả lời sai, đáp án đúng là ${result}`);
      setIsWrong(true);
      updatePoint(point);
      return;
    }
    toast.success(`Chúc mừng, bạn đã trả lời đúng`);
    setFirstValue(getRandomNumber(1, 100000));
    setSecondValue(getRandomNumber(1, 100000));
    setOperator(getRandomOperator());
    setPoint((pre) => pre + 1);
    setValueAnswer(0);
  };

  const handleChangeAnswer = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValueAnswer(+e.target.value);

  return (
    <ChallengeLayoutStyled>
      {isUpdatingPoint && <Spinner />}
      <Heading $as="h2" className="heading">
        Điểm cao nhất: <span className="heading--point">{point}</span>
      </Heading>
      <BoxQuestion>
        <Heading $as="h3">Kết quả của phép tính:</Heading>
        <span>{firstValue}</span>
        <span>{operator}</span>
        <span>{secondValue}</span>
        <input
          type="number"
          className="input"
          onChange={handleChangeAnswer}
          value={valueAnswer}
        />
      </BoxQuestion>

      {!isWrong ? (
        <Button onClick={handleAnswerQuestion}>Trả lời</Button>
      ) : (
        <Button onClick={() => navigate(PAGES_CONSTANT.home)}>
          Bạn đã trả lời sai, quay lại trang chủ
        </Button>
      )}
    </ChallengeLayoutStyled>
  );
}
