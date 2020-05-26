const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const User = require('../../src/models/user');
const expect = chai.expect;

chai.use(chaiHttp);

describe('change pseudo', () => {
  let user;

  beforeEach(async () => {
    user = new User({
      pseudo: 'Nounous',
      token: 'nounous-super-token',
    });

    await user.save();
  });

  afterEach(async () => {
    await User.deleteMany({token: 'nounous-super-token'});
  });

  it('should change the pseudo if called', async () => {
    const newP = {pseudo: 'MyNewPseudo'};
    const res = await chai.request(app)
      .put('/user')
      .set('Authorization', `Bearer ${user.token}`)
      .send(newP);
    expect(res.status).to.equal(200);

    const res2 = await chai.request(app)
      .get('/user')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res2.body.pseudo).to.equal(newP.pseudo);
  });
  it('should not update the pseudo if more than 20 characters', async () => {
    const newP = {pseudo: 'I am a very very very long new pseudo'};
    const res = await chai.request(app)
      .put('/user')
      .set('Authorization', `Bearer ${user.token}`)
      .send(newP);

    expect(res.status).to.equal(400);
  });
});
