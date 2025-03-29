import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface Account__1 {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export type BlockIndex = bigint;
export interface Campaign {
  'id' : string,
  'status' : CampaignStatus,
  'title' : string,
  'owner' : Principal,
  'date' : Time,
  'file' : [] | [File],
  'description' : string,
  'collected' : bigint,
  'target' : bigint,
}
export type CampaignStatus = { 'active' : null } |
  { 'released' : null } |
  { 'pending_release' : null };
export interface Donation {
  'timestamp' : Time,
  'amount' : bigint,
  'donor' : Principal,
}
export interface File {
  'name' : string,
  'fileType' : string,
  'totalSize' : bigint,
  'chunks' : Array<FileChunk>,
}
export interface FileChunk { 'chunk' : Uint8Array | number[], 'index' : bigint }
export type Result = { 'ok' : boolean } |
  { 'err' : string };
export type Result_1 = { 'ok' : BlockIndex } |
  { 'err' : string };
export type Result_2 = { 'ok' : string } |
  { 'err' : string };
export type Result_3 = { 'ok' : bigint } |
  { 'err' : string };
export type Time = bigint;
export interface TransferArgs { 'toAccount' : Account, 'amount' : bigint }
export interface VeriFund {
  'createCampaign' : ActorMethod<
    [Principal, string, string, bigint, Time],
    boolean
  >,
  'deleteCampaignFile' : ActorMethod<[Principal, string, string], boolean>,
  'donate' : ActorMethod<[Principal, string, bigint], boolean>,
  'getAuditor' : ActorMethod<[string], [] | [Principal]>,
  'getBalance' : ActorMethod<[Account__1], Result_3>,
  'getCampaignAccount' : ActorMethod<[bigint], Account__1>,
  'getCampaignFileChunk' : ActorMethod<
    [string, bigint],
    [] | [Uint8Array | number[]]
  >,
  'getCampaignFileTotalChunks' : ActorMethod<[string], bigint>,
  'getCampaignFileType' : ActorMethod<[string], [] | [string]>,
  'getCampaigns' : ActorMethod<[], Array<Campaign>>,
  'getCampaignsByUser' : ActorMethod<[Principal], Array<Campaign>>,
  'getCanisterAccount' : ActorMethod<[], Account__1>,
  'getCertifiedData' : ActorMethod<[], Uint8Array | number[]>,
  'getDonationsByID' : ActorMethod<[string], Array<Donation>>,
  'getDonationsByUser' : ActorMethod<[Principal], Array<Donation>>,
  'getICPUSD' : ActorMethod<[], string>,
  'getMyPendingCampaigns' : ActorMethod<[Principal], Array<string>>,
  'getMyStake' : ActorMethod<[Principal], bigint>,
  'pickAuditor' : ActorMethod<[string], boolean>,
  'recordDonation' : ActorMethod<[bigint, bigint], Result_2>,
  'releaseDecision' : ActorMethod<[string, boolean], boolean>,
  'stakeAsAuditor' : ActorMethod<[bigint], boolean>,
  'transfer' : ActorMethod<[TransferArgs], Result_1>,
  'transform' : ActorMethod<
    [{ 'context' : Uint8Array | number[], 'response' : http_request_result }],
    http_request_result
  >,
  'uploadCampaignFile' : ActorMethod<
    [Principal, string, string, Uint8Array | number[], bigint, string],
    boolean
  >,
  'verifyTransaction' : ActorMethod<[BlockIndex], Result>,
  'whoami' : ActorMethod<[], Principal>,
}
export interface http_header { 'value' : string, 'name' : string }
export interface http_request_result {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<http_header>,
}
export interface _SERVICE extends VeriFund {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
