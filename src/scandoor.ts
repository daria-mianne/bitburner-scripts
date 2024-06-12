import { NS } from '@ns';
import { targets, factionHosts } from '/lib/config';

type CallbackWithArgs<T extends (...args: unknown[]) => unknown> = {
    callback: T;
    args?: Parameters<T>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CallbackType = CallbackWithArgs<(...args: any[]) => unknown>;

function tryWrapper(ns: NS, defaultCallback: CallbackType, successCallback?: CallbackType, catchCallback?: CallbackType) {
    try {
        if (defaultCallback.args)
            defaultCallback.callback(...defaultCallback.args);
        else
            defaultCallback.callback();

        if (successCallback) {
            if (successCallback.args)
                successCallback.callback(...successCallback.args);
            else
                successCallback.callback();
        }
    } catch (e) {
        try {
            if (catchCallback) {
                if (catchCallback.args)
                    catchCallback.callback(...catchCallback.args);
                else
                    catchCallback.callback();
            }
        } catch (e: unknown) {
            const ex = e as Error;
            ns.tprint('e.message ', ex.message);
            ns.tprint('e.stack ', ex.stack);
            ns.tprint('catchCallback ', catchCallback?.callback);
            ns.tprint('catchCallbackArgs ', catchCallback?.args);
        }
    }
}

function openPorts(ns: NS, host: string) {
    let ports = 0;
    const incPorts = () => {
        ports++;
    }

    tryWrapper(ns, {callback: ns.brutessh, args: [host]}, {callback: incPorts});
    tryWrapper(ns, {callback: ns.ftpcrack, args: [host]}, {callback: incPorts});
    tryWrapper(ns, {callback: ns.relaysmtp, args: [host]}, {callback: incPorts});
    tryWrapper(ns, {callback: ns.httpworm, args: [host]}, {callback: incPorts});
    tryWrapper(ns, {callback: ns.sqlinject, args: [host]}, {callback: incPorts});

    ns.tprint(`Opened ${ports} ports on ${host}`);

    tryWrapper(ns, {callback: ns.nuke, args: [host]});
}

export async function main(ns: NS) {
    const skippedServers: string[] = [];
    const successfulNukes: string[] = [];
    const failedNukes: string[] = [];
    const hosts = [...targets, ...factionHosts]
        .filter((host) => {
            if (ns.hasRootAccess(host)) {
                skippedServers.push(host);
                return false;
            }
            return true;
        });

    for (const host of hosts) {
        openPorts(ns, host);
        if (ns.hasRootAccess(host)) {
            successfulNukes.push(host);
        } else {
            failedNukes.push(host);
        }
    }

    ns.tprint(`Skipped servers (already had root): ${skippedServers.join(', ') || 'none'}`);
    ns.tprint(`Newly nuked servers: ${successfulNukes.join(', ') || 'none'}`);
    ns.tprint(`Failed to nuke servers: ${failedNukes.join(', ') || 'none'}`);
}