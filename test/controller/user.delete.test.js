const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('logout', () => {
  let agent;

  beforeEach(async () => {
    agent = chai.request.agent(app);
    const res = await agent
    .get(`/user`);
  });

  it('should destroy the cookie', async () => {
    const res = await agent
    .delete('/user');
    expect(res.status).to.equal(200);
    expect(res.headers['set-cookie'][0]).to.equal("CACoro=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });
})
