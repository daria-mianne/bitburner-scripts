import { HostToNumberMap } from "./utils/types";

export const hackScript = 'hacks.js';
export const buyScript = 'buyAndStartServers.js';
export const startHacksScript = 'starthacks.js';
export const configScript = 'config.js';
export const weights: HostToNumberMap = {
  'n00dles': 1,
  'foodnstuff': 1,
  'joesguns': 1,
  'omega-net': 1,
  'syscore': 1,
  'neo-net': 1,
  'sigma-cosmetics': 2,
  'max-hardware': 2,
  'harakiri-sushi': 2,
  'zer0': 3,
  'computek': 3,
  'hong-fang-tea': 3,
  'nectar-net': 4,
  'iron-gym': 5,
  'phantasy': 5,
  'catalyst': 7,
  'zb-def': 7,
  'zb-institute': 8,
  'silver-helix': 10,
  'netlink': 10,
  'crush-fitness': 12,
  'johnson-ortho': 15,
  '4sigma': 18,
  'the-hub': 20,
  'rothman-uni': 20,
  'summit-uni': 25,
  'fulcrumtech': 25,
  'clarkinc': 30,
  'fulcrumassets': 30,
  'kuai-gong': 40,
};
export const targets = Object.keys(weights);
export const factionHosts = ['CSEC', 'avmnite-02h', 'I.I.I.I', 'run4theh111z', '.', 'The-Cave'/*, 'w0r1d_d43m0n'*/, 'nwo'];
export const serverPrefix = 'worker';
export const minHackContinuanceValue = Math.pow(10, 4);
export const minGrowStoppageValue = Math.pow(10, 5);