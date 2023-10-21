import { v4 as uuidv4 } from "uuid";
const randomKey = (): string => uuidv4();

const getErrorMessage = (err: any): string => err.response.data.message;

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomOperator() {
  const operators = ["+", "-", "*"];
  const randomIndex = getRandomNumber(0, operators.length - 1);
  return operators[randomIndex];
}

export { randomKey, getErrorMessage, getRandomNumber, getRandomOperator };
