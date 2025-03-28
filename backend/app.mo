import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import CertifiedData "mo:base/CertifiedData";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMapBase "mo:base/HashMap";
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
import IC "ic:aaaaa-aa"; 
import { phash; thash } "mo:map/Map";
import HashMapMap "mo:map/Map";
import Icrc1Ledger "canister:icrc1_ledger_canister";
import Result "mo:base/Result";
import Error "mo:base/Error";

actor class VeriFund() = this {

  // Types
  type FileChunk = {
    chunk : Blob;
    index : Nat;
  };

  type File = {
    name : Text;
    chunks : [FileChunk];
    totalSize : Nat;
    fileType : Text;
  };

  type UserFiles = HashMapMap.Map<Text, File>;

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
    file: ?File; // Store the actual File object
  };

  type Donation = {
    donor: Principal;
    amount: Nat;
    timestamp: Time.Time;
  };

  type TransferArgs = {
    amount : Nat;
    toAccount : Icrc1Ledger.Account;
  };

  // STABLE MEMORY STORAGE
  stable var campaignsStore : [(Text, Campaign)] = [];
  stable var donationsStore : [(Text, [Donation])] = [];
  stable var stakesStore : [(Principal, Nat)] = [];
  stable var auditorsStore : [(Text, Principal)] = [];
  stable var certifiedState : Blob = Blob.fromArray([]);

  // WORKING HASHMAPBases
  var files = HashMapMap.new<Principal, UserFiles>();
  var campaigns : HashMapBase.HashMap<Text, Campaign> = HashMapBase.fromIter<Text, Campaign>(campaignsStore.vals(), 0, Text.equal, Text.hash);
  var donations : HashMapBase.HashMap<Text, [Donation]> = HashMapBase.fromIter<Text, [Donation]>(donationsStore.vals(), 0, Text.equal, Text.hash);
  var stakes : HashMapBase.HashMap<Principal, Nat> = HashMapBase.fromIter<Principal, Nat>(stakesStore.vals(), 0, Principal.equal, Principal.hash);
  var auditors : HashMapBase.HashMap<Text, Principal> = HashMapBase.fromIter<Text, Principal>(auditorsStore.vals(), 0, Text.equal, Text.hash);
  
  // Per-user reminder storage
  var reminderFlags : HashMapBase.HashMap<Principal, [Text]> = HashMapBase.HashMap<Principal, [Text]>(0, Principal.equal, Principal.hash);

  // Serialize before upgrade (to stable memory)
  system func preupgrade() {
    campaignsStore := Iter.toArray(campaigns.entries());
    donationsStore := Iter.toArray(donations.entries());
    stakesStore := Iter.toArray(stakes.entries());
    auditorsStore := Iter.toArray(auditors.entries());
  };

  // Restore after upgrade (to working hashmapBases) + start reminder timer
  system func postupgrade() {
    campaigns := HashMapBase.fromIter(campaignsStore.vals(), 0, Text.equal, Text.hash);
    donations := HashMapBase.fromIter(donationsStore.vals(), 0, Text.equal, Text.hash);
    stakes := HashMapBase.fromIter(stakesStore.vals(), 0, Principal.equal, Principal.hash);
    auditors := HashMapBase.fromIter(auditorsStore.vals(), 0, Text.equal, Text.hash);

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

  // Types
  type Account = Icrc1Ledger.Account;
  type Subaccount = Icrc1Ledger.Subaccount;
  type Tokens = Nat;
  type Memo = Blob;
  type Timestamp = Nat64;
  type BlockIndex = Nat;
  
  // Get the account balance
  public shared func getBalance(account : Account) : async Result.Result<Nat, Text> {
    try {
      let balance = await Icrc1Ledger.icrc1_balance_of(account);
      #ok(balance)
    } catch (error : Error) {
      #err("Error getting balance: " # Error.message(error))
    }
  };
  
  // Get the default account for this canister
  public func getCanisterAccount() : async Account {
    {
      owner = Principal.fromActor(this);
      subaccount = null;
    }
  };
  
  // Create an account for a campaign
  public func getCampaignAccount(campaignId : Nat) : async Account {
    // You can use the campaignId to create a unique subaccount
    // This is a simple example - you might want a more sophisticated approach
    let subaccount = generateSubaccount(campaignId);
    
    {
      owner = Principal.fromActor(this);
      subaccount = ?subaccount;
    }
  };
  
  // Helper function to generate a subaccount from a campaign ID
  private func generateSubaccount(campaignId : Nat) : Blob {
    let idAsText = Nat.toText(campaignId);
    let paddedId = Text.concat("0000000000000000000000000000000", idAsText);
    
    // Get the last 32 characters
    let start = Text.size(paddedId) - 32;
    let chars = Text.toIter(paddedId);
    var i = 0;
    var result = "";
    
    for (c in chars) {
      if (i >= start) {
        result := result # Text.fromChar(c);
      };
      i += 1;
    };
    
    // Convert to blob
    Text.encodeUtf8(result)
  };
  
  // Transfer tokens from this canister to another account
  public shared func transfer(args : TransferArgs) : async Result.Result<BlockIndex, Text> {
    Debug.print(
      "Transferring "
      # debug_show (args.amount)
      # " tokens to account"
      # debug_show (args.toAccount)
    );

    let transferArgs : Icrc1Ledger.TransferArg = {
      memo = null;
      amount = args.amount;
      from_subaccount = null;
      fee = null;
      to = args.toAccount;
      created_at_time = null;
    };

    try {
      let transferResult = await Icrc1Ledger.icrc1_transfer(transferArgs);
      switch (transferResult) {
        case (#Err(transferError)) {
          return #err("Couldn't transfer funds:\n" # debug_show (transferError));
        };
        case (#Ok(blockIndex)) { return #ok blockIndex };
      };
    } catch (error : Error) {
      return #err("Reject message: " # Error.message(error));
    };
  };
  
  // Record a donation after it has been verified
  public shared({ caller }) func recordDonation(campaignId : Nat, amount : Nat) : async Result.Result<Text, Text> {
    // Here you would:
    // 1. Verify the transaction happened (by checking the ledger)
    // 2. Update your campaign data to reflect the donation
    // 3. Return success or failure
    
    // This is a placeholder implementation
    #ok("Donation of " # Nat.toText(amount) # " recorded for campaign " # Nat.toText(campaignId))
  };
  
  // Verify a transaction on the ledger
  public func verifyTransaction(blockIndex : BlockIndex) : async Result.Result<Bool, Text> {
    // In a real implementation, you would query the ledger to verify the transaction
    // This is a placeholder
    #ok(true)
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
  
  public func createCampaign(owner: Principal, title: Text, description: Text, target: Nat, date:Time.Time): async Bool {
    let id = "campaign_" # Nat.toText(campaignCounter);
    campaignCounter += 1;

    if (Option.isSome(campaigns.get(id))) return false;
    campaigns.put(id, {
      id; title; description; owner; target; collected = 0; status = #active; date; file = null;
    });
    updateCertifiedData();
    return true;
  };

public func uploadCampaignFile(owner: Principal, id: Text, name: Text, chunk: Blob, index: Nat, fileType: Text) : async Bool {
  switch (campaigns.get(id)) {
    case (?camp) {
      if (camp.owner != owner) return false;

      let fileChunk = { chunk = chunk; index = index };
      let updatedFile = {
        name;
        chunks = if (index == 0) [fileChunk] else Array.append(
          Option.get(camp.file, { name = ""; chunks = []; totalSize = 0; fileType = "" }).chunks, 
          [fileChunk]
        );
        totalSize = if (index == 0) chunk.size() else (
          Option.get(camp.file, { name = ""; chunks = []; totalSize = 0; fileType = "" }).totalSize + chunk.size()
        );
        fileType;
      };

      campaigns.put(id, { camp with file = ?updatedFile });
      return true;
    };
    case null return false;
  };
};

  public  func deleteCampaignFile(owner: Principal, id: Text, name: Text) : async Bool {
    switch (campaigns.get(id)) {
      case (?camp) {
        if (camp.owner != owner) return false;
        
        switch (camp.file) {
          case (?file) {
            if (file.name == name) {
              campaigns.put(id, { camp with file = null });
              return true;
            };
            return false;
          };
          case null return false;
        };
      };
      case null return false;
    };
  };

  public query func getCampaignFileTotalChunks(id: Text) : async Nat {
    switch (campaigns.get(id)) {
      case (?camp) {
        switch (camp.file) {
          case (?file) file.chunks.size();
          case null 0;
        };
      };
      case null 0;
    };
  };

  public query func getCampaignFileChunk(id: Text, index: Nat) : async ?Blob {
    switch (campaigns.get(id)) {
      case (?camp) {
        switch (camp.file) {
          case (?file) {
            let chunk = Array.find(file.chunks, func(chunk : FileChunk) : Bool { 
              chunk.index == index 
            });
            switch (chunk) {
              case (?foundChunk) ?foundChunk.chunk;
              case null null;
            };
          };
          case null null;
        };
      };
      case null null;
    };
  };

  public query func getCampaignFileType(id: Text) : async ?Text {
    switch (campaigns.get(id)) {
      case (?camp) {
        switch (camp.file) {
          case (?file) ?file.fileType;
          case null null;
        };
      };
      case null null;
    };
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
    reminderFlags := HashMapBase.HashMap<Principal, [Text]>(0, Principal.equal, Principal.hash);
    for ((id, camp) in campaigns.entries()) {
      if (camp.status == #pending_release) {
        let existing = Option.get(reminderFlags.get(camp.owner), []);
        reminderFlags.put(camp.owner, Array.append(existing, [id]));
        Debug.print("Reminder flagged for: " # Principal.toText(camp.owner));
      };
    };
  };

// This transform function is required for HTTPS outcalls to strip headers.
  public query func transform({
    context : Blob;
    response : IC.http_request_result;
  }) : async IC.http_request_result {
    {
      response with headers = [];
    };
  };

  public func getICPUSD() : async Text {
    let host : Text = "api.exchange.coinbase.com";
    let url = "https://" # host # "/products/ICP-USD/ticker";
    let request_headers = [
      { name = "User-Agent"; value = "price-feed" },
    ];

    let http_request : IC.http_request_args = {
      url = url;
      max_response_bytes = null;
      headers = request_headers;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
    };

    Cycles.add<system>(230_000_000_000);
    let http_response : IC.http_request_result = await IC.http_request(http_request);

    let decoded_text : Text = switch (Text.decodeUtf8(http_response.body)) {
      case null { "No value returned" };
      case (?y) { y };
    };

    let partsArr = Iter.toArray(Text.split(decoded_text, #text "\"price\":\""));
    if (partsArr.size() < 2) return " Unavailable ";
    let after_price = partsArr[1];

    let quoteArr = Iter.toArray(Text.split(after_price, #text "\""));
    if (quoteArr.size() < 1) return " Unavailable ";
    let price_str = quoteArr[0];

    return price_str;
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

