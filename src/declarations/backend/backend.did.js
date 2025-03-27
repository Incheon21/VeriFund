export const idlFactory = ({ IDL }) => {
  const DonationEntry = IDL.Record({
    'amount' : IDL.Nat,
    'donor' : IDL.Principal,
  });
  const Time = IDL.Int;
  const Report = IDL.Record({
    'verified' : IDL.Bool,
    'proofLink' : IDL.Text,
    'description' : IDL.Text,
    'amountUsed' : IDL.Nat,
    'timestamp' : Time,
  });
  const Event = IDL.Record({
    'title' : IDL.Text,
    'description' : IDL.Text,
    'targetAmount' : IDL.Nat,
    'collectedAmount' : IDL.Nat,
  });
  return IDL.Service({
    'createEvent' : IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [IDL.Bool], []),
    'donate' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    'getCertifiedData' : IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
    'getEventDonations' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(DonationEntry)],
        ['query'],
      ),
    'getEventReports' : IDL.Func([IDL.Text], [IDL.Vec(Report)], ['query']),
    'getEvents' : IDL.Func([], [IDL.Vec(Event)], ['query']),
    'submitReport' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Text],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
