export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Account__1 = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Result_3 = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
  const CampaignStatus = IDL.Variant({
    active: IDL.Null,
    released: IDL.Null,
    pending_release: IDL.Null,
  });
  const FileChunk = IDL.Record({
    chunk: IDL.Vec(IDL.Nat8),
    index: IDL.Nat,
  });
  const File = IDL.Record({
    name: IDL.Text,
    fileType: IDL.Text,
    totalSize: IDL.Nat,
    chunks: IDL.Vec(FileChunk),
  });
  const Campaign = IDL.Record({
    id: IDL.Text,
    status: CampaignStatus,
    title: IDL.Text,
    owner: IDL.Principal,
    date: Time,
    file: IDL.Opt(File),
    description: IDL.Text,
    collected: IDL.Nat,
    target: IDL.Nat,
  });
  const Donation = IDL.Record({
    timestamp: Time,
    amount: IDL.Nat,
    donor: IDL.Principal,
  });
  const Proof = IDL.Record({
    url: IDL.Text,
    verified: IDL.Bool,
    description: IDL.Text,
    timestamp: Time,
  });
  const Result_2 = IDL.Variant({ ok: IDL.Text, err: IDL.Text });
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const TransferArgs = IDL.Record({
    toAccount: Account,
    amount: IDL.Nat,
  });
  const BlockIndex = IDL.Nat;
  const Result_1 = IDL.Variant({ ok: BlockIndex, err: IDL.Text });
  const http_header = IDL.Record({ value: IDL.Text, name: IDL.Text });
  const http_request_result = IDL.Record({
    status: IDL.Nat,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(http_header),
  });
  const Result = IDL.Variant({ ok: IDL.Bool, err: IDL.Text });
  const VeriFund = IDL.Service({
    checkFileExists: IDL.Func([IDL.Text], [IDL.Bool], []),
    createCampaign: IDL.Func([IDL.Principal, IDL.Text, IDL.Text, IDL.Nat, Time], [IDL.Bool], []),
    deleteCampaignFile: IDL.Func([IDL.Principal, IDL.Text, IDL.Text], [IDL.Bool], []),
    deleteFile: IDL.Func([IDL.Text], [IDL.Bool], []),
    donate: IDL.Func([IDL.Principal, IDL.Text, IDL.Nat], [IDL.Bool], []),
    getAuditor: IDL.Func([IDL.Text], [IDL.Opt(IDL.Principal)], ["query"]),
    getBalance: IDL.Func([Account__1], [Result_3], []),
    getCampaignAccount: IDL.Func([IDL.Nat], [Account__1], []),
    getCampaigns: IDL.Func([], [IDL.Vec(Campaign)], ["query"]),
    getCampaignsByUser: IDL.Func([IDL.Principal], [IDL.Vec(Campaign)], ["query"]),
    getCanisterAccount: IDL.Func([], [Account__1], []),
    getCertifiedData: IDL.Func([], [IDL.Vec(IDL.Nat8)], ["query"]),
    getDonationsByID: IDL.Func([IDL.Text], [IDL.Vec(Donation)], ["query"]),
    getDonationsByUser: IDL.Func([IDL.Principal], [IDL.Vec(Donation)], ["query"]),
    getFileChunk: IDL.Func([IDL.Text, IDL.Nat], [IDL.Opt(IDL.Vec(IDL.Nat8))], []),
    getFileType: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], []),
    getFiles: IDL.Func(
      [],
      [
        IDL.Vec(
          IDL.Record({
            name: IDL.Text,
            size: IDL.Nat,
            fileType: IDL.Text,
          })
        ),
      ],
      []
    ),
    getICPUSD: IDL.Func([], [IDL.Text], []),
    getMyPendingCampaigns: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Text)], ["query"]),
    getMyStake: IDL.Func([IDL.Principal], [IDL.Nat], ["query"]),
    getTotalChunks: IDL.Func([IDL.Text], [IDL.Nat], []),
    pickAuditor: IDL.Func([IDL.Text], [IDL.Bool], []),
    recordDonation: IDL.Func([IDL.Nat, IDL.Nat], [Result_2], []),
    releaseDecision: IDL.Func([IDL.Text, IDL.Bool], [IDL.Bool], []),
    stakeAsAuditor: IDL.Func([IDL.Nat], [IDL.Bool], []),
    submitProof: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    transfer: IDL.Func([TransferArgs], [Result_1], []),
    transform: IDL.Func(
      [
        IDL.Record({
          context: IDL.Vec(IDL.Nat8),
          response: http_request_result,
        }),
      ],
      [http_request_result],
      ["query"]
    ),
    uploadCampaignFile: IDL.Func([IDL.Principal, IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8), IDL.Nat, IDL.Text], [IDL.Bool], []),
    uploadFileChunk: IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8), IDL.Nat, IDL.Text], [], []),
    verifyTransaction: IDL.Func([BlockIndex], [Result], []),
    whoami: IDL.Func([], [IDL.Principal], ["query"]),
  });
  return VeriFund;
};
export const init = ({ IDL }) => {
  return [];
};
