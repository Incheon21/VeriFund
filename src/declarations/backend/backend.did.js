export const idlFactory = ({ IDL }) => {
  const DonationEntry = IDL.Record({
    'amount' : IDL.Nat,
    'donor' : IDL.Principal,
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
    'getEventDonations' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(DonationEntry)],
        ['query'],
      ),
    'getEvents' : IDL.Func([], [IDL.Vec(Event)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
