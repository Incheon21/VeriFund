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
export interface Report {
  'verified' : boolean,
  'proofLink' : string,
  'description' : string,
  'amountUsed' : bigint,
  'timestamp' : Time,
}
export type Time = bigint;
export interface _SERVICE {
  'createEvent' : ActorMethod<[string, string, bigint], boolean>,
  'donate' : ActorMethod<[string, bigint], boolean>,
  'getCertifiedData' : ActorMethod<[], Uint8Array | number[]>,
  'getEventDonations' : ActorMethod<[string], Array<DonationEntry>>,
  'getEventReports' : ActorMethod<[string], Array<Report>>,
  'getEvents' : ActorMethod<[], Array<Event>>,
  'submitReport' : ActorMethod<[string, string, bigint, string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
