import CryptoJS from 'crypto-js';

const TILES = [
  { number: 0, color: "white" },
  { number: 11, color: "black" },
  { number: 5, color: "red" },
  { number: 10, color: "black" },
  { number: 6, color: "red" },
  { number: 9, color: "black" },
  { number: 7, color: "red" },
  { number: 8, color: "black" },
  { number: 1, color: "red" },
  { number: 14, color: "black" },
  { number: 2, color: "red" },
  { number: 13, color: "black" },
  { number: 3, color: "red" },
  { number: 12, color: "black" },
  { number: 4, color: "red" },
];

const CLIENT_SEED = "0000000000000000000292453e3be843129d4a0fb13f6249935524225b545c7b";

export default class BlazeVerifier {
  static generatePreviousResults(serverSeed: string, amount: number = 10) {
    const chain = [serverSeed];

    // Gera a cadeia de seeds anteriores
    for (let i = 0; i < amount; i++) {
      const previousSeed = CryptoJS.SHA256(chain[chain.length - 1]).toString();
      chain.push(previousSeed);
    }

    // Converte seeds em resultados
    return chain.map(seed => {
      const hash = CryptoJS.HmacSHA256(CLIENT_SEED, seed).toString();
      const integ = parseInt(hash.slice(0, 8), 16);
      const randval = integ / Math.pow(2, 32);
      const n = Math.floor(randval * 15);

      const tile = TILES.find(t => t.number === n);
      return {
        number: n,
        color: tile?.color || 'red',
        seed: seed,
        hash: hash
      };
    });
  }

  static verifyResult(serverSeed: string) {
    const hash = CryptoJS.HmacSHA256(CLIENT_SEED, serverSeed).toString();
    const integ = parseInt(hash.slice(0, 8), 16);
    const randval = integ / Math.pow(2, 32);
    const n = Math.floor(randval * 15);

    const tile = TILES.find(t => t.number === n);
    return {
      number: n,
      color: tile?.color || 'red',
      verified: true
    };
  }
} 