import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import CertifiedData "mo:base/CertifiedData";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Random "mo:base/Random";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Timer "mo:base/Timer";


actor class VeriFund() = this {

  // Types
  type CampaignStatus = { #active; #pending_release; #released };

  type Campaign = {
    id: Text;
    title: Text;
    owner: Principal;
    description: Text;
    target: Nat;
    collected: Nat;
    status: CampaignStatus;
    date: Time.Time;
  };

  type Donation = {
    donor: Principal;
    amount: Nat;
    timestamp: Time.Time;
  };

  type Proof = {
    url: Text;
    description: Text;
    timestamp: Time.Time;
    verified: Bool;
  };

  // STABLE MEMORY STORAGE
  stable var campaignsStore : [(Text, Campaign)] = [];
  stable var donationsStore : [(Text, [Donation])] = [];
  stable var proofsStore : [(Text, [Proof])] = [];
  stable var stakesStore : [(Principal, Nat)] = [];
  stable var auditorsStore : [(Text, Principal)] = [];
  stable var certifiedState : Blob = Blob.fromArray([]);

  // WORKING HASHMAPs
  var campaigns : HashMap.HashMap<Text, Campaign> = HashMap.fromIter<Text, Campaign>(campaignsStore.vals(), 0, Text.equal, Text.hash);
  var donations : HashMap.HashMap<Text, [Donation]> = HashMap.fromIter<Text, [Donation]>(donationsStore.vals(), 0, Text.equal, Text.hash);
  var proofs : HashMap.HashMap<Text, [Proof]> = HashMap.fromIter<Text, [Proof]>(proofsStore.vals(), 0, Text.equal, Text.hash);
  var stakes : HashMap.HashMap<Principal, Nat> = HashMap.fromIter<Principal, Nat>(stakesStore.vals(), 0, Principal.equal, Principal.hash);
  var auditors : HashMap.HashMap<Text, Principal> = HashMap.fromIter<Text, Principal>(auditorsStore.vals(), 0, Text.equal, Text.hash);
  
  // Per-user reminder storage
  var reminderFlags : HashMap.HashMap<Principal, [Text]> = HashMap.HashMap<Principal, [Text]>(0, Principal.equal, Principal.hash);

  // Serialize before upgrade (to stable memory)
  system func preupgrade() {
    campaignsStore := Iter.toArray(campaigns.entries());
    donationsStore := Iter.toArray(donations.entries());
    proofsStore := Iter.toArray(proofs.entries());
    stakesStore := Iter.toArray(stakes.entries());
    auditorsStore := Iter.toArray(auditors.entries());
  };

  // Restore after upgrade (to working hashmaps) + start reminder timer
  system func postupgrade() {
    campaigns := HashMap.fromIter(campaignsStore.vals(), 0, Text.equal, Text.hash);
    donations := HashMap.fromIter(donationsStore.vals(), 0, Text.equal, Text.hash);
    proofs := HashMap.fromIter(proofsStore.vals(), 0, Text.equal, Text.hash);
    stakes := HashMap.fromIter(stakesStore.vals(), 0, Principal.equal, Principal.hash);
    auditors := HashMap.fromIter(auditorsStore.vals(), 0, Text.equal, Text.hash);

    let nowSec : Nat = Int.abs(Time.now() / 1_000_000_000);
    let daily : Nat = 86400;

    // Start recurring reminder timer every 24h
    ignore Timer.setTimer<system>(
      #seconds (daily - (nowSec % daily)),
      func () : async () {
        ignore Timer.recurringTimer<system>(#seconds daily, remind);
        await remind();
      }
    );
  };

  // Certified data: returns a blob that represents certified state
  private func updateCertifiedData() {
    let summary = "Campaigns: " # Nat.toText(campaigns.size()) #
              ", Donations: " # Nat.toText(donations.size());
    certifiedState := Text.encodeUtf8(summary);
    CertifiedData.set(certifiedState);
  };

  // Used by frontend to verify certified summary of the current state
  public query func getCertifiedData(): async Blob {
    certifiedState
  };

  stable var campaignCounter: Nat = 0; 
  
  public func createCampaign(owner:Principal, title: Text, description: Text, target: Nat, date:Time.Time): async Bool {
      let id = "campaign_" # Nat.toText(campaignCounter);
      campaignCounter += 1;
  
      if (Option.isSome(campaigns.get(id))) return false;
      campaigns.put(id, {
        id; title; description; owner; target; collected = 0; status = #active; date;
      });
      updateCertifiedData();
      return true;
  };

  // Donate ICP (mocked) to a specific campaign
  public func donate(donor:Principal, id: Text, amount: Nat): async Bool {
    switch (campaigns.get(id)) {
      case null return false;
      case (?camp) {
        if (camp.status != #active) return false;
        campaigns.put(id, { camp with collected = camp.collected + amount });

        let donation: Donation = {
          donor;
          amount;
          timestamp = Time.now();
        };

        let updated = switch (donations.get(id)) {
          case null { [donation] };
          case (?list) { Array.append(list, [donation]) };
        };
        donations.put(id, updated);
        updateCertifiedData();
        return true;
      };
    };
  };

  // Submit external proof for usage of funds (Fundraiser role)
  public shared(_) func submitProof(id: Text, url: Text, description: Text): async Bool {
    if (Option.isNull(campaigns.get(id))) return false;
    let verified = Text.startsWith(url, #text "https://");
    let proof: Proof = {
      url; description; timestamp = Time.now(); verified
    };

    let updated = switch (proofs.get(id)) {
      case null { [proof] };
      case (?list) { Array.append(list, [proof]) };
    };
    proofs.put(id, updated);

    switch (campaigns.get(id)) {
      case (?camp) campaigns.put(id, { camp with status = #pending_release });
      case null {}
    };
    updateCertifiedData();
    return true;
  };

  // Allow user to stake ICP to become an auditor
  public shared(msg) func stakeAsAuditor(amount: Nat): async Bool {
    let prev = Option.get(stakes.get(msg.caller), 0);
    stakes.put(msg.caller, prev + amount);
    return true;
  };

  // Auditor decision to release or reject fund release
  public shared(msg) func releaseDecision(id: Text, approve: Bool): async Bool {
    switch (auditors.get(id)) {
      case (?aud) if (aud != msg.caller) return false;
      case _ {};
    };
    switch (campaigns.get(id)) {
      case (?camp) {
        if (camp.status != #pending_release) return false;
        let newStatus = if (approve) #released else #active;
        campaigns.put(id, { camp with status = newStatus });
        updateCertifiedData();
        return true;
      };
      case null return false;
    };
  };

  // Select a random auditor for a campaign (used internally or externally)
  public shared func pickAuditor(id: Text): async Bool {
    let keys = Iter.toArray(stakes.keys());
    if (Array.size(keys) == 0) return false;
    let rand = await Random.blob();
    let byte = Blob.toArray(rand)[0];
    let i = Nat8.toNat(byte) % Array.size(keys);
    let selected = keys[i];
    auditors.put(id, selected);
    return true;
  };

  // Reminder logic run daily — updates reminderFlags per fundraiser
  private func remind() : async () {
    reminderFlags := HashMap.HashMap<Principal, [Text]>(0, Principal.equal, Principal.hash);
    for ((id, camp) in campaigns.entries()) {
      if (camp.status == #pending_release) {
        let existing = Option.get(reminderFlags.get(camp.owner), []);
        reminderFlags.put(camp.owner, Array.append(existing, [id]));
        Debug.print("Reminder flagged for: " # Principal.toText(camp.owner));
      };
    };
  };

  // Returns campaigns that the specified user must submit proof for (used in frontend)
  public query func getMyPendingCampaigns(who: Principal) : async [Text] {
    let filtered = Iter.filter<(Text, Campaign)>(
      campaigns.entries(),
      func((id: Text, camp: Campaign)) : Bool {
        camp.owner == who and camp.status == #pending_release
      }
    );

    let mapped = Iter.map<(Text, Campaign), Text>(
      filtered,
      func((id: Text, _)) : Text { id }
    );

    Iter.toArray<Text>(mapped);
  };

  // Queries
  public query func getCampaigns(): async [Campaign] {
    Iter.toArray(campaigns.vals());
  };

  public query func getCampaignsByUser(user: Principal): async [Campaign] {
    let filtered = Iter.filter<(Text, Campaign)>(
      campaigns.entries(),
      func((id: Text, camp: Campaign)) : Bool {
        camp.owner == user
      }
    );

    let mapped = Iter.map<(Text, Campaign), Campaign>(
      filtered,
      func((id: Text, camp: Campaign)) : Campaign {
        camp
      }
    );

    Iter.toArray(mapped);
  };

  public query func getDonationsByID(id: Text): async [Donation] {
    Option.get(donations.get(id), []);
  };

  public query func getDonationsByUser(user: Principal): async [Donation] {
    let allDonations : [Donation] = Array.flatten(Iter.toArray(donations.vals()));

    Array.filter<Donation>(allDonations, func(d: Donation) : Bool {
      d.donor == user
    });
  };

  public query func getProofs(id: Text): async [Proof] {
    Option.get(proofs.get(id), []);
  };

  public query func getAuditor(id: Text): async ?Principal {
    auditors.get(id);
  };

  public query func getMyStake(who: Principal): async Nat {
    Option.get(stakes.get(who), 0);
  };

  public query (message) func whoami() : async Principal {
    message.caller;
  };
};

