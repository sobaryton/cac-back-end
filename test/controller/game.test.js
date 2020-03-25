const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Game API', () => {
    describe('GET a game information /game/:id', () => {
        it('should return successful status 200', async () => {
            const res = await chai.request(app)
                .get('/game/41224d776a326fb40f000001')
            expect(res.status).to.equal(200);
        });

        describe ('New game object structure', () => {
            it('should be an object', async () => {
                const res = await chai.request(app)
                    .get('/game/41224d776a326fb40f000001')
                expect(res.body).to.be.an('object');
            });
            it('should contain the requested game id', async () => {
                const res = await chai.request(app)
                    .get('/game/41224d776a326fb40f000001')
                    let idPage = '41224d776a326fb40f000001';
                expect(res.body.id).to.equal(idPage);
            });
            it('should have a status of "waiting"', async () => {
                const res = await chai.request(app)
                    .get('/game/41224d776a326fb40f000001')
                expect(res.body.status).to.equal('waiting');
            });
            xit('should have a list of participants, containing the current user', async () => {
                const res = await chai.request(app)
                    .get('/game/41224d776a326fb40f000001')
                expect(res.body.status).to.equal('waiting');
            });
            it('should have an empty list of rounds', async () => {
                const res = await chai.request(app)
                    .get('/game/41224d776a326fb40f000001')
                expect(res.body.rounds).to.be.an('array');
            });
        });
    });
})
