const sendEmail = require('./sendEmail');
const { read, markSended } = require('./emailSendGuards');
const getSautoOffers = require('./getSautoOffers');
const getAnnonceOffers = require('./getAnnonceOffers');

const filterResults = (results, sent) => {
  return results.filter(result => {
    if (sent[result.link]) return false // already sent
    if (`${result.creator}`.toUpperCase().indexOf('AAA AUTO') !== -1) return false // acka fakt ne :D
    return !/^AUTO/.test(`${result.creator}`.toUpperCase()) // slovem AUTO začíná autobazar
  })
}

const tick = async () => {
  const sent = read()
  let hasResults = false;
  const sautoOffers = filterResults(await getSautoOffers(), sent);
  if (sautoOffers.length > 0) hasResults = true;
  const anonnceOffers = filterResults(await getAnnonceOffers(), sent)
  if (anonnceOffers.length > 0) hasResults = true;

  if (!hasResults) {
    return console.log('Nothing to send.')
  }
  console.log('Sending results by e-mail.')
  sendEmail({
    subject: 'Auta - výsledky',
    text: `
      Nazdar Adame,
      mám pro tebe výsledky z Sauto:
      ${sautoOffers.map(offer => `${offer.link}\n -> ${offer.creator}`).join("        \n")}

      a výsledky z Annonce:
      ${anonnceOffers.map(offer => `${offer.link}\n -> ${offer.creator}`).join("        \n")}
    `,
  })
  markSended(sautoOffers)
  markSended(anonnceOffers)
}

// run me!
tick()
setInterval(tick, 5 * 60 * 1000)
