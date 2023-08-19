import successResponse from '../../fixtures/success-response.json'
import tesdata from '../../fixtures/testdata.json'

describe('API Tests', () => {
  let deckId

  before(function () {
    cy.visit('/')
  });

  it('Should get a new deck', () => {
    cy.request('GET', '/api/deck/new/?jokers_enabled=true')
      .then((response) => {
        expect(response.status).to.eq(successResponse.status_code)
        expect(response.body.success).to.eq(successResponse.success)

        deckId = response.body.deck_id
      })
  })

  it('Should resuffle the deck', () => {
    cy.request('POST', '/api/deck/' + deckId + '/shuffle/?remaining=true')
      .then((response) => {
        expect(response.status).to.eq(successResponse.status_code)
        expect(response.body.success).to.eq(successResponse.success)
        expect(response.body.shuffled).to.eq(successResponse.shuffled)
        expect(response.body.deck_id).to.eq(deckId)
      })
  })

  it('Should deal three cards to each of two players', () => {
    [1, 2].forEach((element) => {
      cy.request('GET', '/api/deck/' + deckId + '/draw/?count=3')
        .then((response) => {
          expect(response.status).to.eq(successResponse.status_code)
          expect(response.body.success).to.eq(successResponse.success)
          expect(response.body.deck_id).to.eq(deckId)

          const player = calculateTotal(response.body.cards)

          if (player === tesdata.blackjack) {
            cy.log('Player' + element + ' has blackjack!')
          }
        })
    })
  })
})

function calculateTotal(cards) {
  let total = 0
  let hasAce = false

  for (const card of cards) {
    if (card.value === 'KING' || card.value === 'QUEEN' || card.value === 'JACK') {
      total += 10
    } else if (card.value === 'ACE') {
      total += 11
      hasAce = true
    } else if (card.value === 'JOKER') {
      return tesdata.blackjack
    } else {
      total += parseInt(card.value)
    }
  }

  if (total > tesdata.blackjack && hasAce) {
    total -= 10
  }

  return total
}