import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

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
export type Time = bigint;
export interface VeriFund {
  'canReviewCampaign' : ActorMethod<[Principal, string], boolean>,
  'createCampaign' : ActorMethod<
    [Principal, string, string, bigint, Time],
    boolean
  >,
  'deleteCampaignFile' : ActorMethod<[Principal, string, string], boolean>,
  'donate' : ActorMethod<[Principal, string, bigint], boolean>,
  'getAuditor' : ActorMethod<[string], [] | [Principal]>,
  'getCampaignFileChunk' : ActorMethod<
    [string, bigint],
    [] | [Uint8Array | number[]]
  >,
  'getCampaignFileTotalChunks' : ActorMethod<[string], bigint>,
  'getCampaignFileType' : ActorMethod<[string], [] | [string]>,
  'getCampaigns' : ActorMethod<[], Array<Campaign>>,
  'getCampaignsByUser' : ActorMethod<[Principal], Array<Campaign>>,
  'getCertifiedData' : ActorMethod<[], Uint8Array | number[]>,
  'getDonationsByID' : ActorMethod<[string], Array<Donation>>,
  'getDonationsByUser' : ActorMethod<[Principal], Array<Donation>>,
  'getICPUSD' : ActorMethod<[], string>,
  'getMyPendingCampaigns' : ActorMethod<[Principal], Array<string>>,
  'getMyStake' : ActorMethod<[Principal], bigint>,
  'getPendingReviewCampaigns' : ActorMethod<[], Array<Campaign>>,
  'pickAuditor' : ActorMethod<[string], boolean>,
  'releaseDecision' : ActorMethod<[Principal, string, boolean], boolean>,
  'requestFundRelease' : ActorMethod<[Principal, string], boolean>,
  'stakeAsAuditor' : ActorMethod<[Principal, bigint], boolean>,
  'transform' : ActorMethod<
    [{ 'context' : Uint8Array | number[], 'response' : http_request_result }],
    http_request_result
  >,
  'uploadCampaignFile' : ActorMethod<
    [Principal, string, string, Uint8Array | number[], bigint, string],
    boolean
  >,
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
