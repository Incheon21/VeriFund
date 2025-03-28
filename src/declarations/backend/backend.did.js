export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const CampaignStatus = IDL.Variant({
    'active' : IDL.Null,
    'released' : IDL.Null,
    'pending_release' : IDL.Null,
  });
  const Campaign = IDL.Record({
    'id' : IDL.Text,
    'status' : CampaignStatus,
    'title' : IDL.Text,
    'owner' : IDL.Principal,
    'date' : Time,
    'description' : IDL.Text,
    'collected' : IDL.Nat,
    'target' : IDL.Nat,
  });
  const Donation = IDL.Record({
    'timestamp' : Time,
    'amount' : IDL.Nat,
    'donor' : IDL.Principal,
  });
  const Proof = IDL.Record({
    'url' : IDL.Text,
    'verified' : IDL.Bool,
    'description' : IDL.Text,
    'timestamp' : Time,
  });
  const http_header = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const http_request_result = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(http_header),
  });
  const VeriFund = IDL.Service({
    'createCampaign' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text, IDL.Nat, Time],
        [IDL.Bool],
        [],
      ),
    'donate' : IDL.Func([IDL.Principal, IDL.Text, IDL.Nat], [IDL.Bool], []),
    'getAuditor' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Principal)], ['query']),
    'getCampaigns' : IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getCampaignsByUser' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Campaign)],
        ['query'],
      ),
    'getCertifiedData' : IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
    'getDonationsByID' : IDL.Func([IDL.Text], [IDL.Vec(Donation)], ['query']),
    'getDonationsByUser' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Donation)],
        ['query'],
      ),
    'getICPUSD' : IDL.Func([], [IDL.Text], []),
    'getMyPendingCampaigns' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Text)],
        ['query'],
      ),
    'getMyStake' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getProofs' : IDL.Func([IDL.Text], [IDL.Vec(Proof)], ['query']),
    'pickAuditor' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'releaseDecision' : IDL.Func([IDL.Text, IDL.Bool], [IDL.Bool], []),
    'stakeAsAuditor' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'submitProof' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    'transform' : IDL.Func(
        [
          IDL.Record({
            'context' : IDL.Vec(IDL.Nat8),
            'response' : http_request_result,
          }),
        ],
        [http_request_result],
        ['query'],
      ),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
  return VeriFund;
};
export const init = ({ IDL }) => { return []; };
