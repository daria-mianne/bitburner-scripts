import { NS } from "@ns";

export function getRamPow(ns: NS) {
    const base = 5; // 32GB
    const offset = ns.getHackingLevel() * ns.getHackingMultipliers().speed / 100;
    return Math.floor(base + offset);
}