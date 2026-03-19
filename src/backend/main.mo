import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


// Apply migration in with clause

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  public type Nurse = {
    id : Text;
    name : Text;
    registrationNumber : Text;
    phone : Text;
    village : Text;
    mandal : Text;
    district : Text;
    pincode : Nat;
    experience : Nat;
    bio : Text;
    profilePhoto : ?Storage.ExternalBlob;
    isAvailable : Bool;
    latitude : ?Float;
    longitude : ?Float;
  };

  public type Feedback = {
    id : Text;
    nurseId : Text;
    patientName : Text;
    rating : Nat;
    reviewText : Text;
    mediaUrls : [Storage.ExternalBlob];
    createdAt : Time.Time;
  };

  public type ServiceProof = {
    id : Text;
    nurseId : Text;
    description : Text;
    photoUrls : [Storage.ExternalBlob];
    videoUrl : ?Storage.ExternalBlob;
    createdAt : Time.Time;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let nurses = Map.empty<Text, Nurse>();
  let feedbacks = Map.empty<Text, Feedback>();
  let serviceProofs = Map.empty<Text, ServiceProof>();

  module Feedback {
    public func compareByCreatedAt(a : Feedback, b : Feedback) : Order.Order {
      let aTime = Int.abs(a.createdAt);
      let bTime = Int.abs(b.createdAt);
      Nat.compare(aTime, bTime);
    };

    public func compareByRating(a : Feedback, b : Feedback) : Order.Order {
      Nat.compare(a.rating, b.rating);
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addNurse(nurse : Nurse) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add nurses");
    };
    validateNurse(nurse);
    if (nurses.containsKey(nurse.id)) {
      Runtime.trap("Nurse already exists with this ID");
    };
    nurses.add(nurse.id, nurse);
  };

  // Public registration - no login required (guests can register)
  public shared func registerNurse(nurse : Nurse) : async () {
    validateNurse(nurse);
    if (nurses.containsKey(nurse.id)) {
      Runtime.trap("Nurse already exists with this ID");
    };
    nurses.add(nurse.id, nurse);
  };

  // Admin-only update
  public shared ({ caller }) func updateNurse(nurse : Nurse) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update nurses");
    };
    validateNurse(nurse);
    switch (nurses.get(nurse.id)) {
      case (null) { Runtime.trap("Nurse does not exist") };
      case (?_) { nurses.add(nurse.id, nurse) };
    };
  };

  // Admin-only delete
  public shared ({ caller }) func deleteNurse(nurseId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete nurses");
    };
    nurses.remove(nurseId);
  };

  public query func getNurse(id : Text) : async ?Nurse {
    nurses.get(id);
  };

  public query func listAllNurses() : async [Nurse] {
    nurses.values().toArray();
  };

  public query func filterByPincode(pincode : Nat) : async [Nurse] {
    let filtered = nurses.values().toArray().filter(
      func(nurse) { nurse.pincode == pincode }
    );
    filtered;
  };

  public shared ({ caller }) func submitFeedback(feedback : Feedback) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit feedback");
    };
    if (feedback.rating < 1 or feedback.rating > 5) {
      Runtime.trap("Invalid rating: must be between 1 and 5");
    };

    switch (nurses.get(feedback.nurseId)) {
      case (null) { Runtime.trap("Nurse does not exist") };
      case (?_) {
        feedbacks.add(feedback.id, feedback);
      };
    };
  };

  public query func getNurseFeedback(nurseId : Text) : async [Feedback] {
    let filtered = feedbacks.values().toArray().filter(
      func(fb) { fb.nurseId == nurseId }
    );
    filtered;
  };

  public query func getAggregateRating(nurseId : Text) : async ?Float {
    let nurseFeedbacks = feedbacks.values().toArray().filter(
      func(fb) { fb.nurseId == nurseId }
    );

    if (nurseFeedbacks.isEmpty()) { return null };

    let totalRatings = nurseFeedbacks.foldLeft(
      0,
      func(acc, fb) { acc + fb.rating },
    );

    let avgRating = totalRatings.toFloat() / nurseFeedbacks.size().toInt().toFloat();
    ?avgRating;
  };

  // Service Proof Logic

  // Public - no login required (guests can add service proofs)
  public shared func addServiceProof(proof : ServiceProof) : async () {
    if (serviceProofs.containsKey(proof.id)) {
      Runtime.trap("Service proof already exists with this ID");
    };
    serviceProofs.add(proof.id, proof);
  };

  // Admin-only update
  public shared ({ caller }) func updateServiceProof(proof : ServiceProof) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update service proofs");
    };
    switch (serviceProofs.get(proof.id)) {
      case (null) { Runtime.trap("Service proof does not exist") };
      case (?_) { serviceProofs.add(proof.id, proof) };
    };
  };

  // Admin-only delete
  public shared ({ caller }) func deleteServiceProof(proofId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete service proofs");
    };
    serviceProofs.remove(proofId);
  };

  public query func getNurseServiceProofs(nurseId : Text) : async [ServiceProof] {
    let filtered = serviceProofs.values().toArray().filter(
      func(proof) { proof.nurseId == nurseId }
    );
    filtered;
  };

  public query func listAllServiceProofs() : async [ServiceProof] {
    serviceProofs.values().toArray();
  };

  // Helper to find nurse by registrationNumber + phone
  public query func findNurseByCredentials(registrationNumber : Text, phone : Text) : async ?Nurse {
    let allNurses = nurses.values().toArray();
    allNurses.find(
      func(nurse) {
        nurse.registrationNumber == registrationNumber and nurse.phone == phone
      }
    );
  };

  func validateNurse(nurse : Nurse) {
    let pinLength = nurse.pincode.toText().size();
    if (pinLength != 6) {
      Runtime.trap("Invalid PIN code. Must be 6 digits");
    };
    if (nurse.registrationNumber == "") {
      Runtime.trap("Nursing Council Registration Number is required");
    };
  };
};
