const app = require('../../../app').listen();
const request = require('supertest')(app);
const should = require('should');
const support = require('../../support');

describe('test /v2/user/:uid/lock', function() {
  let mockUser;
  let mockUser2;
  let mockUser3;

  before(async function() {
    mockUser = await support.createUser('123456@qq.com', '普通用户');
    mockUser2 = await support.createUser('123457@qq.com', '管理员', { role: 1 });
    mockUser3 = await support.createUser('123458@qq.com', '管理员二号', { role: 10 });
  });

  after(async function() {
    await support.deleteUser(mockUser.email);
    await support.deleteUser(mockUser2.email);
    await support.deleteUser(mockUser3.email);
  });

  it('should / status 401 when the not sigin', async function() {
    try {
      const res = await request
        .patch(`/v2/user/${mockUser.id}/lock`)
        .expect(401);

      res.text.should.equal('尚未登录');
    } catch(err) {
      should.ifError(err.message);
    }
  });

  it('should / status 403 when the no permission', async function() {
    try {
      let res = await request
        .post('/signin')
        .send({
          email: mockUser.email,
          password: 'a123456'
        })
        .expect(200);

      res = await request
        .patch(`/v2/user/${mockUser.id}/lock`)
        .set('Authorization', res.text)
        .expect(403);

      res.text.should.equal('需要管理员权限');
    } catch(err) {
      should.ifError(err.message);
    }
  });

  it('should / status 403 when the user is you', async function() {
    try {
      let res = await request
        .post('/signin')
        .send({
          email: mockUser2.email,
          password: 'a123456'
        })
        .expect(200);

      res = await request
        .patch(`/v2/user/${mockUser2.id}/lock`)
        .set('Authorization', res.text)
        .expect(403);

      res.text.should.equal('不能操作自身');
    } catch(err) {
      should.ifError(err.message);
    }
  });

  it('should / status 403 when the user role more than yours', async function() {
    try {
      let res = await request
        .post('/signin')
        .send({
          email: mockUser2.email,
          password: 'a123456'
        })
        .expect(200);

      res = await request
        .patch(`/v2/user/${mockUser3.id}/lock`)
        .set('Authorization', res.text)
        .expect(403);

      res.text.should.equal('不能操作权限值高于自身的用户');
    } catch(err) {
      should.ifError(err.message);
    }
  });

  it('should / status 200 when the action is lock', async function() {
    try {
      let res = await request
        .post('/signin')
        .send({
          email: mockUser2.email,
          password: 'a123456'
        })
        .expect(200);

      res = await request
        .patch(`/v2/user/${mockUser.id}/lock`)
        .set('Authorization', res.text)
        .expect(200);

      res.text.should.equal('lock');
    } catch(err) {
      should.ifError(err.message);
    }
  });

  it('should / status 200 when the action is un_lock', async function() {
    try {
      let res = await request
        .post('/signin')
        .send({
          email: mockUser2.email,
          password: 'a123456'
        })
        .expect(200);

      res = await request
        .patch(`/v2/user/${mockUser.id}/lock`)
        .set('Authorization', res.text)
        .expect(200);

      res.text.should.equal('un_lock');
    } catch(err) {
      should.ifError(err.message);
    }
  });
});
