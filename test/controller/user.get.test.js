const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('user session', () => {
  describe('user creation', () => {
    it('should create a user with a pseudo and userID and return a cookie', async () =>{
      const res = await chai.request(app)
      .get(`/user`);
      expect(res.status).to.equal(200);
      expect(res.body.userId).to.be.a('string');
      expect(res.body.pseudo).to.be.a('string');
    });
  })
});