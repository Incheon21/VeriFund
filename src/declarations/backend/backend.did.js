export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const CampaignStatus = IDL.Variant({
    'active' : IDL.Null,
    'released' : IDL.Null,
    'collected' : IDL.Null,
    'pending_release' : IDL.Null,
  });
  const FileChunk = IDL.Record({
    'chunk' : IDL.Vec(IDL.Nat8),
    'index' : IDL.Nat,
  });
  const File = IDL.Record({
    'name' : IDL.Text,
    'fileType' : IDL.Text,
    'totalSize' : IDL.Nat,
    'chunks' : IDL.Vec(FileChunk),
  });
  const Campaign = IDL.Record({
    'id' : IDL.Text,
    'status' : CampaignStatus,
    'title' : IDL.Text,
    'owner' : IDL.Principal,
    'date' : Time,
    'file' : IDL.Opt(File),
    'description' : IDL.Text,
    'collected' : IDL.Nat,
    'target' : IDL.Nat,
  });
  const Donation = IDL.Record({
    'timestamp' : Time,
    'amount' : IDL.Nat,
    'donor' : IDL.Principal,
  });
  const http_header = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const http_request_result = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(http_header),
  });
  const VeriFund = IDL.Service({
    'canReviewCampaign' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Bool],
        ['query'],
      ),
    'collectFund' : IDL.Func([IDL.Text, IDL.Principal], [IDL.Bool], []),
    'createCampaign' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text, IDL.Nat, Time],
        [IDL.Bool],
        [],
      ),
    'deleteCampaignFile' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text],
        [IDL.Bool],
        [],
      ),
    'donate' : IDL.Func([IDL.Principal, IDL.Text, IDL.Nat], [IDL.Bool], []),
    'getCampaignFileChunk' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        ['query'],
      ),
    'getCampaignFileTotalChunks' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getCampaignFileType' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Text)],
        ['query'],
      ),
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
    'getPendingReviewCampaigns' : IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getReleasedCampaigns' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Text)], []),
    'releaseDecision' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Bool],
        [IDL.Bool],
        [],
      ),
    'requestFundRelease' : IDL.Func([IDL.Principal, IDL.Text], [IDL.Bool], []),
    'stakeAsAuditor' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool], []),
    'transform' : IDL.Func(
        [IDL.Record({ 'response' : http_request_result })],
        [http_request_result],
        ['query'],
      ),
    'uploadCampaignFile' : IDL.Func(
        [
          IDL.Principal,
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Nat8),
          IDL.Nat,
          IDL.Text,
        ],
        [IDL.Bool],
        [],
      ),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
  return VeriFund;
};
export const init = ({ IDL }) => { return []; };
