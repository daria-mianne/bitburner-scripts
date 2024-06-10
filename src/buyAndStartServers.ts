import { NS } from '@ns';
import { ramPow, serverPrefix, startHacksScript } from 'lib/config';

const ramUnits = [
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB',
];
const costUnits = [
    '',
    'k',
    'm',
    'b',
    't',
    'qa',
    'qi',
    'sx',
    'sp',
];

/**
 * @param {NS} ns
 * @param {number} targetPurchaseCount
 * @param {number} maxServers
 * @param {number} ram - Must be a power of 2 (unit is GB)
 * @param {string} displayRam - Human-readable representation of `ram`
 */
function deleteSmallServers(ns: NS, targetPurchaseCount: number, maxServers: number, ram: number, displayRam: string) {
    const ownedServers = ns.getPurchasedServers();
    if (ownedServers.length + targetPurchaseCount > maxServers) {
        ns.tprint(`Checking for up to ${targetPurchaseCount} owned server(s) with less than ${displayRam} of RAM...`);
        const smallServers = ownedServers
            .filter((server) => ns.getServerMaxRam(server) < ram)
            .sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b));
        for (let i = 0; i < smallServers.length && i < targetPurchaseCount; i++) {
            const serverRam = ns.getServerMaxRam(smallServers[i]);
            const serverRamUnitKey = Math.floor(Math.log(serverRam) / Math.log(1024));
            const serverDisplayRam = `${serverRam / Math.pow(1024, serverRamUnitKey)}${ramUnits[serverRamUnitKey]}`;
            ns.tprint(`\t${smallServers[i]} has only ${serverDisplayRam}; deleting...`);
            ns.killall(smallServers[i]);
            if (!ns.deleteServer(smallServers[i])) ns.tprint('ERROR: Delete failed!');
        }
        ns.tprint(smallServers.length === 0 ? '\tNo such servers available to delete.' : '\tDone!');
    }
}

/**
 * @param {NS} ns
 * @param {number} targetPurchaseCount
 * @param {number} maxServers
 * @param {number} ram - Must be a power of 2 (unit is GB)
 * @param {string} displayRam - Human-readable representation of `ram`
 */
function buyNewServers(ns: NS, targetPurchaseCount: number, maxServers: number, ram: number, displayRam: string) {
    ns.tprint(`Purchasing up to ${targetPurchaseCount} server(s) with ${displayRam} RAM...`);
    for (let i = 0; i < targetPurchaseCount && i < maxServers; i++) {
        const serverName = ns.purchaseServer(serverPrefix, ram);
        if (serverName === '') {
            ns.tprint('ERROR: Purchase failed! You probably ran out of servers you\'re allowed to buy.');
            break;
        }
        ns.tprint(`\tBought ${serverName}...`);
    }
    ns.tprint('\tDone!');
}

/** @param {NS} ns */
export async function main(ns: NS) {
    const maxServers = 25;
    const ram = Math.pow(2, ns.args[0] ? Number(ns.args[0]) : ramPow);
    const ramUnitKey = Math.floor(Math.log(ram) / Math.log(1024));
    const displayRam = `${ram / Math.pow(1024, ramUnitKey)}${ramUnits[ramUnitKey]}`;

    ns.tprint(`Checking cost for servers with ${displayRam} of RAM...`);
    const costPerServer = ns.getPurchasedServerCost(ram);
    const costUnitKey = Math.floor(Math.log(costPerServer) / Math.log(1000));
    const displayCost = `$${Math.round(costPerServer * 100 / Math.pow(1000, costUnitKey)) / 100}${costUnits[costUnitKey]}`;
    ns.tprint(`\tCost per server is ${displayCost}`);
    const targetPurchaseCount = Math.floor(ns.getServerMoneyAvailable('home') / costPerServer);
    if (targetPurchaseCount === 0) {
        ns.tprint('ERROR: Purchase failed! Insufficient funds to buy any servers!');
    } else {
        deleteSmallServers(ns, targetPurchaseCount, maxServers, ram, displayRam);
        buyNewServers(ns, targetPurchaseCount, maxServers, ram, displayRam);
    }

    ns.tprint('Starting hacks...');
    ns.exec(startHacksScript, 'home', 1, '--nokill');
}