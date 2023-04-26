const nock = require('nock')
const sinon = require('sinon')
const { expect } = require('chai')
const axios = require('axios')
const { getPokemon } = require('../util/pokemon')
const { getPounds, getFeetAndInches } = require('../util/convertUnits')

// Only includes relevant data
const POKEMON_RESPONSE = {
  name: 'gengar',
  height: 15,
  sprites: {
    other: {
      "official-artwork": {
        "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
      }
    }
  },
  types: [
    {
      "slot": 1,
      "type": {
        "name": "ghost",
        "url": "https://pokeapi.co/api/v2/type/8/"
      }
    },
    {
      "slot": 2,
      "type": {
        "name": "poison",
        "url": "https://pokeapi.co/api/v2/type/4/"
      }
    }
  ],
  weight: 405
}

describe('pokemon api util', () => {
  let axiosStub
  before(() => nock.disableNetConnect())
  beforeEach(async () => {
    axiosStub = sinon.stub(axios, 'get').resolves({data: POKEMON_RESPONSE})
  })
  afterEach(async () => {
    sinon.restore()
  })
  after(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  describe('getPokemon(name)', () => {
    it('should call pokemon url with given name', async () => {
      const pokemonData = await getPokemon('banana')
      expect(axiosStub.called).to.be.true
      //(axiosStub.firstCall.args[0].includes('banana'))
      expect(axiosStub.firstCall.args[0].includes('banana')).to.be.true
    })
    //checked
    it('should return pokemon name', async () => {
      const pokemonData = await getPokemon('banana')
      expect(pokemonData.name).to.eq(POKEMON_RESPONSE.name)
    })
    //checked
    it('should return pokemon official artwork sprite', async () => {
      const pokemonSprite = await getPokemon('banana') 
      expect(pokemonSprite.sprite).to.eq(POKEMON_RESPONSE.sprites.other["official-artwork"]["front_default"])

    })
    //checked 
    it('should return pokemon height in feet and inches', async () => {
      const pokemonData = await getPokemon('banana')
      //console.log(pokemonData.height)
      const newHeight = getFeetAndInches(POKEMON_RESPONSE.height)
     // console.log(newHeight)
      expect(pokemonData.height).to.eq(newHeight)

    })
    //checked
    it('should return pokemon weight in pounds', async () => {
      const pokemonData = await getPokemon('banana')
      const newWeight = getPounds(POKEMON_RESPONSE.weight)
      expect(pokemonData.weight).to.eq(newWeight)

    })
    //checked
    it('should throw error if axios errors', async () => {
      axiosStub.restore()
      sinon.stub(axios, 'get').throws(new Error('oh no'))
      try {
        const pokemon = await getPokemon('banana')
        expect(pokemon).to.not.exist
      } catch(err) {
        expect(err).to.exist
        expect(err.message).to.eq('oh no')
      }
    })
  })
})
