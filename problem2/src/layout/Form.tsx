import { Button, Input, Spinner } from "@/components";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { FaLongArrowAltRight } from "react-icons/fa";
import Select, { SingleValue } from "react-select";
import currencyCode from "currency-codes";
import toast from "react-hot-toast";
import axios from "axios";

const Container = styled.main`
  width: 120rem;
  margin: 6rem auto;
`;

const ContainerForm = styled.div`
  min-height: 40vh;
  display: flex;
  justify-content: center;
  padding: 2rem 4rem;
  box-shadow: var(--shadow-around);
  border-radius: 2rem;
  overflow: hidden;
  background-color: var(--color-grey-100);
`;

const FormStyled = styled.form`
  width: 100%;

  .icon-switch {
    height: 4rem;
    width: 4rem;
    flex-shrink: 0;
    cursor: pointer;
    margin-top: 3rem;
  }

  .heading {
    font-weight: 600;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 2rem;
  }

  .description {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 2rem;
  }

  .box--input {
    display: flex;
    align-items: center;
    gap: 2rem;
    &-item {
      width: 100%;
      position: relative;

      label {
        display: inline-block;
        font-size: 2rem;
        font-weight: 500;
        margin-bottom: 1rem;
        cursor: pointer;
      }

      &-select {
        position: absolute;
        top: 0;
        right: 0;
        width: 15rem;
      }
    }
  }

  .box--btn {
    margin: 3rem auto 0;
    width: 40rem;
  }
`;
interface IOptionSelect {
  value: string | null;
  label: string;
}

export default function Form() {
  const [inputCurrency, setInputCurrency] = useState<number>(0);
  const [outputCurrency, setOutputCurrency] = useState<number>(0);
  const [typeInputCurrency, setTypeInputCurrency] = useState<any>(null);
  const [typeOutputCurrency, setTypeOutputCurrency] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedOptionInputCurrency = () => {
    return currencyCode.codes().map((code) => ({
      label: code,
      value: code,
    }));
  };

  const selectedOptionOutputCurrency = () => {
    return currencyCode.codes().map((code) => ({
      label: code,
      value: code,
    }));
  };

  const handleSelectInputCurrency = (option: SingleValue<string>) =>
    setTypeInputCurrency(option);

  const handleSelectOutCurrency = (option: SingleValue<string>) =>
    setTypeOutputCurrency(option);

  const handleChangeInputCurrency = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputCurrency(+e.target.value);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputCurrency)
      return toast.error("Vui lòng nhập số tiền cần chuyển đổi");
    if (!typeInputCurrency)
      return toast.error("Vui lòng nhập đơn vị tiền cần chuyển");
    if (!typeOutputCurrency)
      return toast.error("Vui lòng nhập đơn vị tiền muốn chuyển thành");
    if (+inputCurrency <= 0)
      return toast.error(
        `Số tiền phải lớn hơn 1 hoặc bằng ${typeInputCurrency.value}`
      );

    try {
      setIsLoading(true);
      const result = await axios.get(
        `https://api.api-ninjas.com/v1/convertcurrency?have=${typeInputCurrency.value}&want=${typeOutputCurrency.value}&amount=${inputCurrency}`
      );
      if (result.data) {
        console.log(result.data);
        setIsLoading(false);
        setOutputCurrency(result.data.new_amount);
      }
    } catch (error) {
      toast.error("Lỗi chuyển đổi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {}, []);

  return (
    <Container>
      <ContainerForm>
        <FormStyled onSubmit={onSubmit}>
          <h2 className="heading">Chuyển đổi tiền tệ</h2>
          <h3 className="description">
            <span>{typeInputCurrency?.value}</span> <FaLongArrowAltRight />
            <span>{typeOutputCurrency?.value}</span>
          </h3>
          <div className="box--input">
            <div className="box--input-item">
              <label htmlFor="rootCurrency">Nhập số tiền cần chuyển</label>
              <Input
                id="rootCurrency"
                type="number"
                onChange={handleChangeInputCurrency}
                value={inputCurrency}
              />

              <Select
                value={typeInputCurrency}
                onChange={handleSelectInputCurrency}
                options={selectedOptionInputCurrency()}
                className="box--input-item-select"
              />
            </div>
            <HiArrowsRightLeft className="icon-switch" />
            <div className="box--input-item">
              <label htmlFor="resultCurrency">Kết quả</label>
              <Input id="resultCurrency" type="number" value={outputCurrency} />
              <Select
                value={typeOutputCurrency}
                onChange={handleSelectOutCurrency}
                options={selectedOptionOutputCurrency()}
                className="box--input-item-select"
              />
            </div>
          </div>
          <div className="box--btn">
            <Button disabled={isLoading}>
              {isLoading ? <Spinner /> : <span>Chuyển đổi</span>}
            </Button>
          </div>
        </FormStyled>
      </ContainerForm>
    </Container>
  );
}
