import bcrypt = require('bcryptjs');
import { env } from '../configs';
import { ValueTransformer } from 'typeorm';
import { createHmac, randomBytes } from 'crypto';

const { salt_round: saltRounds } = env.app;

export const createHash = (data: string): string => {
  return bcrypt.hashSync(data, saltRounds);
};

export const compareHash = (data: string, hash: string): boolean => {
  return bcrypt.compareSync(data, hash);
};

export const transformerPassword: ValueTransformer = {
  to: function (value: string) {
    return createHash(value);
  },
  from: function (value: string) {
    return value;
  },
};

export const generateRandomPassword = (
  length: number,
  specialChars: string = '@#$%^&+!=',
  numericChars: string = '0123456789',
  lowercaseChars: string = 'abcdefghijklmnopqrstuvwxyz',
  uppercaseChars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
): string => {
  const allCharacters =
    specialChars + numericChars + lowercaseChars + uppercaseChars;

  let password = '';
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  password += numericChars[Math.floor(Math.random() * numericChars.length)];
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  const minLength = length;
  const remainingLength = Math.max(minLength - password.length, 0);

  for (let i = 0; i < remainingLength; i++) {
    password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
  }
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

export const generateSalt = (length = 10) => {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

export const hashPassword = (password: string, salt = generateSalt()) => {
  const hash = createHmac('sha512', salt);
  hash.update(password);
  const hashedPassword = hash.digest('hex');
  return { salt, hashedPassword };
};

export const checkPassword = (
  password: string,
  hashedPassword: string,
  salt: string
) => {
  const hash = createHmac('sha512', salt);
  hash.update(password);
  const newHashedPassword = hash.digest('hex');
  return newHashedPassword === hashedPassword;
};
