import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface DonationEntry { 'amount' : bigint, 'donor' : Principal }
export interface Event {
  'title' : string,
  'description' : string,
  'targetAmount' : bigint,
  'collectedAmount' : bigint,
}
export interface _SERVICE {
  'createEvent' : ActorMethod<[string, string, bigint], boolean>,
  'donate' : ActorMethod<[string, bigint], boolean>,
  'getEventDonations' : ActorMethod<[string], Array<DonationEntry>>,
  'getEvents' : ActorMethod<[], Array<Event>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
