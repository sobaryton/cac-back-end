const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('change pseudo', () => {
  let agent;

  beforeEach(async () => {
    agent = chai.request.agent(app);
    // Log in.
    await agent.get(`/user`);
  });

  it('should change the pseudo if called', async () => {
    const newP = {pseudo: 'MyNewPseudo'};
    const res = await agent
      .put('/user')
      .send(newP);
    expect(res.status).to.equal(200);

    const res2 = await agent
      .get('/user');
    expect(res2.body.pseudo).to.equal(newP.pseudo);
  });
  it('should not update the pseudo if more than 20 characters', async () => {
    const newP = {pseudo: 'I am a very very very long new pseudo'};
    const res = await agent
      .put('/user')
      .send(newP);

    expect(res.status).to.equal(400);
  });
});
