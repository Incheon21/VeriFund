import Bool "mo:base/Bool";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import CertifiedData "mo:base/CertifiedData";

actor DonationPlatform {

  type Event = {
    title : Text;
    description : Text;
    targetAmount : Nat;
    collectedAmount : Nat;
  };

  type DonationEntry = {
    donor : Principal;
    amount : Nat;
  };

  type Report = {
    timestamp: Time.Time;
    description: Text;
    amountUsed: Nat;
    proofLink: Text;
    verified: Bool;
  };

  private var events = HashMap.HashMap<Text, Event>(0, Text.equal, Text.hash);
  private var eventDonations = HashMap.HashMap<Text, [DonationEntry]>(0, Text.equal, Text.hash);
  private var eventReports = HashMap.HashMap<Text, [Report]>(0, Text.equal, Text.hash);
  private stable var certifiedState : Blob = Blob.fromArray([]);

  // Create a new donation event
  public shared (_) func createEvent(title: Text, description: Text, targetAmount: Nat) : async Bool {
    if (Option.isSome(events.get(title))) {
      return false;
    };
    let newEvent : Event = {
      title = title;
      description = description;
      targetAmount = targetAmount;
      collectedAmount = 0
    };
    events.put(title, newEvent);
    updateCertifiedData();
    return true;
  };

  // Get list of events
  public shared query func getEvents() : async [Event] {
    Iter.toArray(events.vals());
  };

  // Record a donation
  public shared (msg) func donate(eventTitle: Text, amount: Nat) : async Bool {
    switch (events.get(eventTitle)) {
      case null { return false; };
      case (?event) {
        let updatedEvent = {
          title = event.title;
          description = event.description;
          targetAmount = event.targetAmount;
          collectedAmount = event.collectedAmount + amount
        };
        events.put(eventTitle, updatedEvent);

        let donationEntry = { donor = msg.caller; amount = amount };
        switch (eventDonations.get(eventTitle)) {
          case null {
            eventDonations.put(eventTitle, [donationEntry]);
          };
          case (?donations) {
            eventDonations.put(eventTitle, Array.append(donations, [donationEntry]));
          };
        };
        updateCertifiedData();
        return true;
      };
    };
  };

  // Get all donations for an event
  public shared query func getEventDonations(eventTitle: Text) : async [DonationEntry] {
    switch (eventDonations.get(eventTitle)) {
      case null { return []; };
      case (?donations) { return donations; };
    };
  };

  // Submit a report with proof (mock HTTPS validation)
  public shared (msg) func submitReport(eventTitle: Text, description: Text, amountUsed: Nat, proofLink: Text) : async Bool {
    if (Option.isNull(events.get(eventTitle))) return false;

    let isValid = Text.startsWith(proofLink, #text "https://");

    let newReport: Report = {
      timestamp = Time.now();
      description;
      amountUsed;
      proofLink;
      verified = isValid;
    };

    let updatedReports = switch (eventReports.get(eventTitle)) {
      case null { [newReport] };
      case (?existing) { Array.append(existing, [newReport]) };
    };

    eventReports.put(eventTitle, updatedReports);
    updateCertifiedData();
    return true;
  };

  // Get all reports for an event
  public query func getEventReports(eventTitle: Text) : async [Report] {
    switch (eventReports.get(eventTitle)) {
    case null { [] };
    case (?reports) { reports };
  }
  };

  // Certified data helpers
  private func updateCertifiedData() {
    let data = Text.encodeUtf8("VeriFundDataUpdated");
    certifiedState := data;
    CertifiedData.set(data);
  };

  public query func getCertifiedData() : async Blob {
    certifiedState
  };
};
