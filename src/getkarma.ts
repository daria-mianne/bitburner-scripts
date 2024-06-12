import { NS } from "@ns";

export async function main(ns: NS) {
    ns.heart.break();
    ns.tprint(ns.heart.break());
}