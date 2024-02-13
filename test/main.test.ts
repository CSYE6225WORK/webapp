import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import app from '../src/app';
import supertest from 'supertest';
import prisma from '../src/db';
import createPrismaMock from 'prisma-mock';
import { Prisma, PrismaClient } from '@prisma/client';

const request = supertest(app);
const prismaMock = prisma as DeepMockProxy<PrismaClient>;

jest.mock('../src/db', () => ({
  __esModule: true,
  ...jest.requireActual('../src/db'),
  default: mockDeep<PrismaClient>()
}));

beforeEach(() => {
  mockReset(prismaMock);
  createPrismaMock<PrismaClient>(
    {
      user: [
        {
          id: '71ca60ea-cd6c-4632-a2e6-3095b6aaedc8',
          first_name: 'Jason',
          last_name: 'Li',
          username: 'jane.doe@example.com',
          password: '$2a$10$pcDUXf3nNPwmuDtk4BOreufOUjhevPvqqFSu1voekft8Ho7W2Wqwu',
          account_created: null,
          account_updated: null
        }
      ]
    },
    Prisma.dmmf.datamodel,
    prismaMock as any
  );
});

describe('api integration test', () => {
  // describe('get api/v1/healthz', () => {
  //   it('should return status 200', async () => {
  //     const res = await request.get('/api/v1/healthz');
  //     expect(res.statusCode).toBe(200);
  //     expect(res.body).toEqual({});
  //   });

  //   it('should return status 400', async () => {
  //     const res = await request.get('/api/v1/healthz').send({
  //       test: 'test'
  //     });
  //     expect(res.statusCode).toBe(400);
  //     expect(res.body).toEqual({});
  //   });

  //   it('should return status 405', async () => {
  //     const res = await request.post('/api/v1/healthz');
  //     expect(res.statusCode).toBe(405);
  //     expect(res.body).toEqual({});
  //   });
  // });

  describe('get api/v1/404', () => {
    it('should return status 404', async () => {
      const res = await request.get('/api/v1/404');
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({});
    });
  });

  describe('get api/v1/user', () => {
    it('should return status 401', async () => {
      const res = await request.get('/api/v1/user').auth('sasd', 'asdsa', { type: 'basic' });
      expect(res.statusCode).toBe(401);
    });

    it('should return status 200', async () => {
      const res = await request
        .get('/api/v1/user')
        .auth('jane.doe@example.com', 'skdjfhskdfjhg', { type: 'basic' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual({
        id: '71ca60ea-cd6c-4632-a2e6-3095b6aaedc8',
        first_name: 'Jason',
        last_name: 'Li',
        username: 'jane.doe@example.com',
        account_created: null,
        account_updated: null
      });
    });

    it('should return status 400', async () => {
      const res = await request
        .get('/api/v1/user')
        .auth('jane.doe@example.com', 'skdjfhskdfjhg', { type: 'basic' })
        .send({
          test: 'test'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual('cannot have body');
    });
  });

  describe('post api/v1/user', () => {
    it('should return status 201', async () => {
      const res = await request.post('/api/v1/user').send({
        first_name: 'test',
        last_name: 'test',
        password: 'skdjfhskdfjhg',
        username: 'test@example.com'
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.data).toEqual({
        first_name: 'test',
        last_name: 'test',
        password: 'skdjfhskdfjhg',
        username: 'test@example.com'
      });
    });

    it('should return status 400', async () => {
      const res = await request.post('/api/v1/user').send({
        first_name: 'test',
        last_name: 'test',
        password: 'skdjfhskdfjhg'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual(
        'body must include username and password and first_name and last_name'
      );
    });

    it('should return status 400', async () => {
      const res = await request.post('/api/v1/user').send({
        id: '1'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual(
        'body should not include id or account_created or account_updated'
      );
    });

    it('should return status 400', async () => {
      const res = await request.post('/api/v1/user').send({
        test: 'test'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual(
        'body must include username and password and first_name and last_name'
      );
    });

    it('should return status 400', async () => {
      const res = await request.post('/api/v1/user').send({
        first_name: 'test',
        last_name: 'test',
        password: 'skdjfhskdfjhg',
        username: 'test'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual('username must be a valid email address');
    });
  });

  describe('put api/v1/user', () => {
    it('should return status 204', async () => {
      const res = await request
        .put('/api/v1/user')
        .auth('jane.doe@example.com', 'skdjfhskdfjhg', { type: 'basic' })
        .send({
          first_name: 'Jason',
          last_name: 'Li'
        });
      expect(res.statusCode).toBe(204);
    });

    it('should return status 401', async () => {
      const res = await request.put('/api/v1/user').auth('test', 'test', { type: 'basic' }).send({
        first_name: 'Jason',
        last_name: 'Li'
      });
      expect(res.statusCode).toBe(401);
    });

    it('should return status 400', async () => {
      const res = await request
        .put('/api/v1/user')
        .auth('jane.doe@example.com', 'skdjfhskdfjhg', { type: 'basic' })
        .send({
          test: 'test'
        });
      expect(res.statusCode).toBe(400);
    });

    it('should return status 400', async () => {
      const res = await request
        .put('/api/v1/user')
        .auth('jane.doe@example.com', 'skdjfhskdfjhg', { type: 'basic' })
        .send({
          username: 'jason'
        });
      expect(res.statusCode).toBe(400);
    });
  });
});
