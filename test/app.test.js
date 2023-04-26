const { expect } = require('chai')
const sinon = require('sinon')
const request = require('supertest')
const { JSDOM } = require('jsdom')
const nock = require('nock')
const app = require('../app')
const pokeUtil = require('../util/pokemon')

const POKEMON_DATA = {
  name: 'gengar',
  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
  types: ['ghost', 'poison'],
  height: '4 feet 11 inches',
  weight: '89 pounds'
}

describe('Server Routes', () => {
  describe('GET / - pokemon form', () => {
    //checked
    it('should return 200 status', async () => {
      await request(app)
        .get('/')
        .expect(200)
    })
    //checked
    it('should return content-type html header', async () => {
      await request(app)
        .get('/')
        .expect(200)
        .expect('content-type', /html/)
    })
    //checked
    it('should render form with action of "/pokemon"', async () => {
      const res = await request(app)
        .get('/')
        .expect(200)
      const { window: { document } } = new JSDOM(res.text)
      expect(document.querySelector('form')).to.exist
      // if (document.querySelector('form')) {
      //   console.log('exists')
      // }
    })
    //checked
    it('should return input element with name attribute of "name"', async () => {
    const res = await request(app)
      .get('/')
      .expect(200)
    const { window: { document } } = new JSDOM(res.text)
    const nameEl = document.querySelector('[name="name"]')
    // if(nameEl) {
    //   console.log('exists')
    // }
    expect(nameEl).to.exist
  })
})
  describe('GET /pokemon - pokemon info page', () => {
    let pokeStub
    before(() => {
      nock.disableNetConnect()
      nock.enableNetConnect('127.0.0.1')
    })
    beforeEach(() => {
      pokeStub = sinon.stub(pokeUtil, 'getPokemon').resolves(POKEMON_DATA)
    })
    afterEach(sinon.restore)
    after(() => {
      nock.cleanAll()
      nock.enableNetConnect()
    })
    //checked
    it('should redirect to / if name query param not included', async () => {
      await request(app)
        .get('/pokemon')
        .expect(302)
        .expect('location', '/')
    })
    //checked
    it('/pokemon?name=pokemonName should render pokemon name', async () => {
      const res = await request(app)
        .get('/pokemon?name=banana')
        .expect(200)
      expect(pokeStub.calledWith('banana'))
      const { window: { document } } = new JSDOM(res.text)
      const nameEl = document.querySelector('[data-test-id="pokemon-name"]')
      expect(nameEl.textContent).to.include(POKEMON_DATA.name)
    })
    //checked
    it('/pokemon?name=pokemonName should render pokemon image', async () => {
      const res = await request(app)
        .get('/pokemon?name=pokemonName')
        .expect(200)
      expect(pokeStub.calledWith('bananas'))
      const {window: {document}} = new JSDOM(res.text)
      const imgEl = document.querySelector('img')
      expect(imgEl.src).includes(POKEMON_DATA.sprite)
    })
    //checked
    it('/pokemon?name=pokemonName should render pokemon types', async () => {
      const res = await request(app)
        .get('/pokemon?name=pokemonName')
        .expect(200)
      expect(pokeStub.calledWith('banana'))
      const { window: { document }} = new JSDOM(res.text)
      const typeEl = document.querySelector('p')
      expect(typeEl.textContent).to.include(POKEMON_DATA.types[0])
    })
    //checked 
    it('/pokemon?name=pokemonName should render pokemon height', async () => {
      const res = await request(app)
        .get('/pokemon?name=pokemonName')
        .expect(200)
      expect(pokeStub.calledWith('banana'))
      const {window : {document}} = new JSDOM(res.text)
      const heightEl = document.querySelector('[data-test-id="height"]')
      expect(heightEl.textContent).to.include(POKEMON_DATA.height)
    })
    //checked
    it('/pokemon?name=pokemonName should render pokemon weight', async () => {
      const res = await request(app)
        .get('/pokemon?name=pokemonName')
        .expect(200)
      expect(pokeStub.calledWith('banana'))
      const {window : {document}} = new JSDOM(res.text)
      const weightEl = document.querySelector('[data-test-id="weight"]')
      expect(weightEl.textContent).to.include(POKEMON_DATA.weight)

    })
    //checked
    it('should render "Pokemon not found" if given non-existent pokemon', async () => {
      pokeStub.restore()
      sinon.stub(pokeUtil, 'getPokemon').rejects(new Error('oh no'))
      const res = await request(app)
        .get('/pokemon?name=banana')
        .expect(200)
      expect(pokeStub.calledWith('banana'))
      expect(res.text).to.match(/pokemon not found/i)
      
    })
  })
})
