import { buyScript, hackScript, startHacksScript, configScript, weights } from './config';
import * as MathUtils from 'lib/mathutils';
import { NS } from '@ns';

type HostToNumberMap = {
    [host: string]: number;
};

/**
 * @param {number} threadsSoFar
 * @param {number} hostWeight
 * @param {number} totalWeight
 * @param {number} hackScriptRam
 * @param {number} availableMemory
 */
function hostToThreads(threadsSoFar: number, hostWeight: number, totalWeight: number, hackScriptRam: number, availableMemory: number) {
    const ramSoFar = threadsSoFar * hackScriptRam;
    const hostWeightFraction = hostWeight / totalWeight;
    const ramRemaining = Math.max(0, availableMemory - ramSoFar);
    const targetTotalThreads = Math.floor(availableMemory / hackScriptRam);

    return MathUtils.bind(
        Math.ceil(hostWeightFraction * targetTotalThreads),
        0,
        Math.floor(ramRemaining / hackScriptRam)
    );
}

/**
 * @param {NS} ns standard NS instance
 * @param {string} server the server the script will run on
 * @returns a map from the hosts to run the script against to the number of threads to run it with on the server
 */
function hostsToThreads(ns: NS, server: string) {
    const hackScriptRam = ns.getScriptRam(hackScript);
    const thisScriptRam = ns.getScriptRam(startHacksScript);
    const buyScriptRam = ns.getScriptRam(buyScript) + thisScriptRam; // the buy script starts this script now
    const largestScriptRam = Math.max(buyScriptRam, hackScriptRam, thisScriptRam);
    let availableMemory = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    if (server === 'home') {
        // ensure home can always run the largest script
        availableMemory += thisScriptRam;
        availableMemory -= largestScriptRam;
        // buffer in case of float math weirdness later
        availableMemory -= 0.1;
    }

    const usableHosts = Object.keys(weights)
        .filter((host) => ns.hasRootAccess(host));

    const usableWeights: HostToNumberMap = usableHosts.reduce(
        (destinationObj, host) => ({
            ...destinationObj,
            [host]: weights[host],
        }), {});
    const totalWeight = MathUtils.sum(Object.values(usableWeights));

    return usableHosts.reduce((destinationObj, host) => ({
        ...destinationObj,
        [host]: hostToThreads(MathUtils.sum(Object.values(destinationObj)), usableWeights[host], totalWeight, hackScriptRam, availableMemory)
    }), {});
}

/** @param {NS} ns */
export async function main(ns: NS) {
    const args = ns.flags([['nokill', false]]);
    const nokill = args.nokill as boolean;
    if (nokill) {
        ns.tprint('Skipping killall for this run.');
    }

    // Run threads on all servers
    const servers = ['home', ...ns.getPurchasedServers()];
    const totalThreadsMap: HostToNumberMap = {};
    const threadsPerServer: HostToNumberMap = {};
    let httMap: HostToNumberMap = {};
    for (const server of servers) {
        ns.scp(hackScript, server, 'home');
        ns.scp(configScript, server, 'home');
        if (!nokill) {
            ns.killall(server);
        }

        httMap = hostsToThreads(ns, server);
        for (const host in httMap) {
            if (httMap[host] === 0) continue;

            if (ns.exec(hackScript, server, httMap[host], `--host=${host}`) !== 0) {
                totalThreadsMap[host] = (totalThreadsMap[host] || 0) + httMap[host];
                threadsPerServer[server] = (threadsPerServer[server] || 0) + httMap[host];
            }
        }
    }

    // Notify how many threads were created
    ns.tprint(`Started ${MathUtils.sum(Object.values(totalThreadsMap))
        } total threads across ${servers.filter(
            (server) =>
                (threadsPerServer[server] !== undefined && threadsPerServer[server] !== 0)
        ).length
        } total servers.`);

    // If any targets were unusable, notify
    const unusedTargets = Object.keys(weights)
        .filter((host) => httMap[host] === undefined);
    if (unusedTargets.length > 0) {
        ns.tprint(`ERROR: Unable to start ${hackScript} against the following hosts due to lack of root priveleges:\n\t${unusedTargets.join(', ')}`);
    }
}