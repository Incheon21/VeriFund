import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";

export interface Campaign {
  id: string;
  status: CampaignStatus;
  title: string;
  owner: Principal;
  description: string;
  collected: bigint;
  target: bigint;
}
export type CampaignStatus =
  | { active: null }
  | { released: null }
  | { pending_release: null };
export interface Donation {
  timestamp: Time;
  amount: bigint;
  donor: Principal;
}
export interface Proof {
  url: string;
  verified: boolean;
  description: string;
  timestamp: Time;
}
export type Time = bigint;
export interface VeriFund {
  createCampaign: ActorMethod<[string, string, string, bigint], boolean>;
  donate: ActorMethod<[string, bigint], boolean>;
  getAuditor: ActorMethod<[string], [] | [Principal]>;
  getCampaigns: ActorMethod<[], Array<Campaign>>;
  getCertifiedData: ActorMethod<[], Uint8Array | number[]>;
  getDonations: ActorMethod<[string], Array<Donation>>;
  getMyPendingCampaigns: ActorMethod<[Principal], Array<string>>;
  getMyStake: ActorMethod<[Principal], bigint>;
  getProofs: ActorMethod<[string], Array<Proof>>;
  pickAuditor: ActorMethod<[string], boolean>;
  releaseDecision: ActorMethod<[string, boolean], boolean>;
  stakeAsAuditor: ActorMethod<[bigint], boolean>;
  submitProof: ActorMethod<[string, string, string], boolean>;
}
export interface _SERVICE extends VeriFund {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
