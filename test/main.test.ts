// import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import app from '../src/app';
import supertest from 'supertest';
// import prisma from '../src/db';
// import createPrismaMock from 'prisma-mock';
// import { Prisma, PrismaClient } from '@prisma/client';

const request = supertest(app);
// const prismaMock = prisma as DeepMockProxy<PrismaClient>;

// jest.mock('../src/db', () => ({
//   __esModule: true,
//   ...jest.requireActual('../src/db'),
//   default: mockDeep<PrismaClient>()
// }));

// beforeEach(() => {
//   mockReset(prismaMock);
//   createPrismaMock<PrismaClient>(
//     {
//       user: [
//         {
//           id: '71ca60ea-cd6c-4632-a2e6-3095b6aaedc8',
//           first_name: 'Jason',
//           last_name: 'Li',
//           username: 'jane.doe@example.com',
//           password: '$2a$10$pcDUXf3nNPwmuDtk4BOreufOUjhevPvqqFSu1voekft8Ho7W2Wqwu',
//           account_created: null,
//           account_updated: null
//         }
//       ]
//     },
//     Prisma.dmmf.datamodel,
//     prismaMock as any
//   );
// });

describe('api integration test', () => {
  describe('get api/v1/healthz', () => {
    it('should return status 200', async () => {
      const res = await request.get('/api/v2/healthz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({});
    });

    it('should return status 400', async () => {
      const res = await request.get('/api/v2/healthz').send({
        test: 'test'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });

    it('should return status 405', async () => {
      const res = await request.post('/api/v2/healthz');
      expect(res.statusCode).toBe(405);
      expect(res.body).toEqual({});
    });
  });

  describe('get api/v1/404', () => {
    it('should return status 404', async () => {
      const res = await request.get('/api/v2/404');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({});
    });
  });

  describe('post api/v1/user', () => {
    it('validate account create success', async () => {
      const res = await request.post('/api/v2/user').send({
        first_name: 'test',
        last_name: 'test',
        password: 'test',
        username: 'test@example.com',
        isSend: true,
        isVerify: true
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.data['password']).toBeUndefined();
    });

    it('should return status 400', async () => {
      const res = await request.post('/api/v2/user').send({
        first_name: 'test',
        last_name: 'test',
        password: 'test'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual(
        'body must include username and password and first_name and last_name'
      );
    });

    it('should return status 400', async () => {
      const res = await request.post('/api/v2/user').send({
        id: '1'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual(
        'body should not include id or account_created or account_updated'
      );
    });

    it('should return status 400', async () => {
      const res = await request.post('/api/v2/user').send({
        test: 'test'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual(
        'body must include username and password and first_name and last_name'
      );
    });

    it('should return status 400', async () => {
      const res = await request.post('/api/v2/user').send({
        first_name: 'test',
        last_name: 'test',
        password: 'test',
        username: 'test'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual('username must be a valid email address');
    });
  });

  describe('get api/v1/user/self', () => {
    it('should return status 401', async () => {
      const res = await request.get('/api/v2/user/self').auth('sasd', 'asdsa', { type: 'basic' });
      expect(res.statusCode).toBe(401);
    });

    it('should return status 400', async () => {
      const res = await request
        .get('/api/v2/user/self')
        .auth('test@example.com', 'test', { type: 'basic' })
        .send({
          test: 'test'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual('cannot have body');
    });

    it('validate account exists', async () => {
      const res = await request
        .get('/api/v2/user/self')
        .auth('test@example.com', 'test', { type: 'basic' });
      expect(res.statusCode).toBe(200);
      const { id, account_created, account_updated, ...rest } = res.body.data;
      expect(rest).toEqual({
        first_name: 'test',
        last_name: 'test',
        username: 'test@example.com',
        isSend: true,
        isVerify: true
      });
    });
  });

  describe('put api/v2/user', () => {
    it('should return status 401', async () => {
      const res = await request.put('/api/v2/user').auth('asds', 'asdasd', { type: 'basic' }).send({
        first_name: 'Jason',
        last_name: 'Li'
      });
      expect(res.statusCode).toBe(401);
    });

    it('should return status 400', async () => {
      const res = await request
        .put('/api/v2/user')
        .auth('test@example.com', 'test', { type: 'basic' })
        .send({
          test: 'test'
        });
      expect(res.statusCode).toBe(400);
    });

    it('should return status 400', async () => {
      const res = await request
        .put('/api/v2/user')
        .auth('test@example.com', 'test', { type: 'basic' })
        .send({
          username: 'jason'
        });
      expect(res.statusCode).toBe(400);
    });

    it('validate the account was updated', async () => {
      const res1 = await request
        .put('/api/v2/user')
        .auth('test@example.com', 'test', { type: 'basic' })
        .send({
          first_name: 'Jason',
          last_name: 'Li'
        });
      const res2 = await request
        .get('/api/v2/user/self')
        .auth('test@example.com', 'test', { type: 'basic' });
      expect(res1.statusCode).toBe(204);
      expect(res2.statusCode).toBe(200);
      const { id, account_created, account_updated, ...rest } = res2.body.data;
      expect(rest).toEqual({
        first_name: 'Jason',
        last_name: 'Li',
        username: 'test@example.com',
        isSend: true,
        isVerify: true
      });
    });

    it('validate the account password was updated', async () => {
      const res1 = await request
        .put('/api/v2/user')
        .auth('test@example.com', 'test', { type: 'basic' })
        .send({
          password: '123'
        });
      const res2 = await request
        .get('/api/v2/user/self')
        .auth('test@example.com', '123', { type: 'basic' });
      expect(res1.statusCode).toBe(204);
      expect(res2.statusCode).toBe(200);
    });
  });
});
