import { Request, Response, NextFunction } from 'express';
import userService from 'src/service/user/userService';
import { sendResponse } from 'src/utils/sendResponse';
import { User } from '@prisma/client';

export const createUserMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password, first_name, last_name, id, account_created, account_updated } =
    req.body as User;

  if (id || account_created || account_updated) {
    res.statusCode = 400;
    sendResponse(res, null, 'incorrect body parameters');
    return;
  }

  if (!username || !password || !first_name || !last_name) {
    res.statusCode = 400;
    sendResponse(res, null, 'incorrect body parameters');
    return;
  }

  try {
    const result = await userService.getUserByUsername(username);
    if (result) {
      res.statusCode = 400;
      sendResponse(res, null, 'user is exist');
      return;
    }
  } catch (err) {
    res.statusCode = 503;
    sendResponse(res, err);
    return;
  }

  next();
};

export const updateUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { username, id, account_created, account_updated, password, first_name, last_name } =
    req.body as User;

  if (id || account_created || account_updated || username) {
    res.statusCode = 400;
    sendResponse(res, null, 'body cannot include id, account_created, account_updated ');
    return;
  }

  if (!password && !first_name && !last_name) {
    res.statusCode = 400;
    sendResponse(res, null, 'incorrect body parameters');
    return;
  }

  next();
};

export const getUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (Object.keys(req.body).length !== 0) {
    res.statusCode = 400;
    sendResponse(res, null, 'cannot have body');
    return;
  }

  next();
};
