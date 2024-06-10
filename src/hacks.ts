import { NS } from '@ns';
import { minHackContinuanceValue, minGrowStoppageValue } from 'lib/config';

async function weaken(ns: NS, host: string, minSec: number) {
    let currentSec = ns.getServerSecurityLevel(host);
    const thresholdSec = Math.max(minSec + 1, minSec * 1.1);
    if (currentSec <= thresholdSec) {
        return;
    }

    let weakenDiff = Number.MAX_SAFE_INTEGER;
    while (weakenDiff > 0.02 && currentSec >= thresholdSec) {
        await ns.weaken(host);
        currentSec = ns.getServerSecurityLevel(host);
        weakenDiff = currentSec - minSec;
    }
}

async function hack(ns: NS, host: string) {
    const minSec = ns.getServerMinSecurityLevel(host);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        // weaken
        await weaken(ns, host, minSec);

        // grow
        while (
            (await ns.grow(host) >= 1.2
                || ns.getServerMoneyAvailable(host) <= minGrowStoppageValue)
            && ns.getServerSecurityLevel(host) <= minSec * 2
        ) {
            // no loop body; the loop condition is the whole thing
        }

        // re-weaken
        await weaken(ns, host, minSec);

        // hack
        try {
            let lastHackValue = Number.MAX_SAFE_INTEGER;
            while (ns.getServerSecurityLevel(host) <= minSec * 2 && lastHackValue > minHackContinuanceValue) {
                lastHackValue = await ns.hack(host);
            }
        } catch (e: unknown) {
            // hacking throws when your skill isn't high enough; no-op the catch so we just do more weakening and growing for xp
            ns.print(`ERROR: Failed to hack ${host} - `, (e as Error).stack);
        }
    }
}

export async function main(ns: NS) {
    const args = ns.flags([['host', '']]);
    const host = args.host as string;
    await hack(ns, host);
}