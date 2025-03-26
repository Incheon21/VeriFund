import Bool "mo:base/Bool";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";  // Changed from "mo:map/Map"
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Option "mo:base/Option";

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
  
  // Initialize with proper hash and equality functions
  private var events = HashMap.HashMap<Text, Event>(0, Text.equal, Text.hash);
  private var eventDonations = HashMap.HashMap<Text, [DonationEntry]>(0, Text.equal, Text.hash);
  
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
    return true;
  };

  // Get list of events
  public shared query func getEvents() : async [Event] {
    Iter.toArray(events.vals());
  };

  // Record a donation (simulating ICP transaction integration)
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
            // Use Array.append instead of # operator
            eventDonations.put(eventTitle, Array.append(donations, [donationEntry]));
          };
        };
        return true;
      };
    };
  };

  // Get all donations for an event
  public shared query func getEventDonations(eventTitle: Text) : async [DonationEntry] {
    switch (eventDonations.get(eventTitle)) {
      case null { return []; };
      case (?donations) {
        return donations;
      };
    };
  };
};