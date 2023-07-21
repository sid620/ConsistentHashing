'use strict';
import * as crypto from 'crypto';
import { ring_size, replication_count } from '../config';

const compute_hash = (key: string) => crypto.createHash("sha256").update(key, "binary").digest('hex');

const ring_location_from_hash = (hash: bigint) => {
    const result = hash % BigInt(ring_size);

    if (result < Number.MIN_SAFE_INTEGER || result > Number.MAX_SAFE_INTEGER)
    {
        console.log("Invalid vnode value generated! Closing the server");
        process.exit();
    }

    return Number(result);
}

const compute_vnode_location = (IP: string, offset: number) => ring_location_from_hash(
    BigInt('0x' + compute_hash(compute_hash(IP) + offset.toString())));

const compute_key_location = (key: string) => ring_location_from_hash(
    BigInt('0x' + compute_hash(key)));

export function add_node(IP: string, PORT: number) {

}

export function remove_by_ip(IP: string, PORT: number) {
    
}

export function remove_by_vnode(vnode: number) {
    
}

export function remove_by_hash(hash: string) {
    
}

export function get_nearest_ip(key: string) {

}