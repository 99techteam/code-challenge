
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import UserService from '@src/services/UserService';

import { IReq, IRes } from './common';
import { UserZSchema } from '@src/models/User';
import { IdZSchema } from '@src/models/IdParam';
import { SearchUserRequestZSchema } from '@src/models/SearchUser';

/**
 * Get all users.
 */
async function search(req: IReq, res: IRes) {
  const request = SearchUserRequestZSchema.parse(req.query);
  const users = await UserService.search(request);
  res.status(HttpStatusCodes.OK).json({ users });
}

/**
 * Get one user.
 */
async function getOne(req: IReq, res: IRes) {
  const { id } = IdZSchema.parse(req.params);
  const user = await UserService.getOne(id);
  res.status(HttpStatusCodes.OK).json(user);
}


/**
 * Add one user.
 */
async function add(req: IReq, res: IRes) {
  const validatedUser = UserZSchema.parse(req.body);
  const newUser = await UserService.addOne(validatedUser);
  res.status(HttpStatusCodes.CREATED).json(newUser);
}

/**
 * Update one user.
 */
async function update(req: IReq, res: IRes) {
  const validatedUser = UserZSchema.parse(req.body);
  const { id } = IdZSchema.parse(req.params);


  await UserService.updateOne(id, validatedUser);
  res.status(HttpStatusCodes.OK).end();
}

/**
 * Delete one user.
 */
async function delete_(req: IReq, res: IRes) {
  const { id } = IdZSchema.parse(req.params);
  await UserService.delete(id);
  res.status(HttpStatusCodes.OK).end();
}

export default {
  search,
  getOne,
  add,
  update,
  delete: delete_,
} as const;
