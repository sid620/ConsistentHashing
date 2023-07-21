'use strict';
import * as crypto from 'crypto';
import { ring_size, replication_count } from '../config';
import * as avl from 'data-structure-typed/src/data-structures/binary-tree/avl-tree';

const vnode_to_node = new Map<number, string>();
const IPs = new Map<string, { PORT: number, vnodes: number[] }>();
const vnode_tree = new avl.AVLTree<number>();


const compute_hash = (key: string) => crypto.createHash("sha256").update(key, "binary").digest('hex');

const ring_location_from_hash = (hash: bigint) => {
    const result = hash % BigInt(ring_size);

    if (result < Number.MIN_SAFE_INTEGER || result > Number.MAX_SAFE_INTEGER)
    {
        console.log("Invalid vnode value generated! Closing the server. Crashing the database.");
        process.exit();
    }

    return Number(result);
}

const compute_vnode_location = (IP: string, offset: number) => ring_location_from_hash(
    BigInt('0x' + compute_hash(compute_hash(IP) + offset.toString())));

const compute_key_location = (key: string) => ring_location_from_hash(
    BigInt('0x' + compute_hash(key)));

export const is_ip_registered = (IP: string) => IP in IPs;

export const get_port_for_ip = (IP: string) => IPs.get(IP);

export const add_node = (IP: string, PORT: number) => {
    if (IP in IPs) {
        console.log("IP already registered. Contact the developer. Crashing the database.");
        process.exit();
    }
    
    let limit = replication_count;
    let vnodes = []
    for (let offset = 0; offset < limit; offset++) {
        const vnode_number = compute_vnode_location(IP, offset);
        if (vnode_number in vnode_to_node) {
            ++limit;
            continue;
        }
        
        vnode_to_node.set(vnode_number, IP);
        vnode_tree.put(vnode_number, 1);
        vnodes.push(vnode_number);
    }
    
    IPs.set(IP, { PORT, vnodes });
}

export const remove_node_by_ip = (IP: string) => {
    if (!(IP in IPs)) {
        console.log("IP is not registered for deletion. Contact the developer. Crashing the database.");
        process.exit();        
    }

    for (let vnode of IPs.get(IP).vnodes) {
        vnode_to_node.delete(vnode);
        vnode_tree.remove(vnode);
    }
    IPs.delete(IP);
}

export const remove_node_by_vnode = (vnode: number) => {
    if (!(vnode in vnode_to_node)) {
        console.log("Virtual node is not registered for deletion. Contact the developer. Crashing the database.");
        process.exit();
    }

    remove_node_by_ip(vnode_to_node.get(vnode));
}

export const get_nearest_ip = (key: string) => {

}