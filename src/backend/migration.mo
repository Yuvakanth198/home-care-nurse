import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldNurse = {
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
  };

  type NewNurse = {
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

  type Feedback = {
    id : Text;
    nurseId : Text;
    patientName : Text;
    rating : Nat;
    reviewText : Text;
    mediaUrls : [Storage.ExternalBlob];
    createdAt : Time.Time;
  };

  type ServiceProof = {
    id : Text;
    nurseId : Text;
    description : Text;
    photoUrls : [Storage.ExternalBlob];
    videoUrl : ?Storage.ExternalBlob;
    createdAt : Time.Time;
  };

  // Actor Types
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : ?Text; phone : ?Text }>;
    nurses : Map.Map<Text, OldNurse>;
    feedbacks : Map.Map<Text, Feedback>;
    serviceProofs : Map.Map<Text, ServiceProof>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : ?Text; phone : ?Text }>;
    nurses : Map.Map<Text, NewNurse>;
    feedbacks : Map.Map<Text, Feedback>;
    serviceProofs : Map.Map<Text, ServiceProof>;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newNurses = old.nurses.map<Text, OldNurse, NewNurse>(
      func(_id, oldNurse) {
        { oldNurse with latitude = null; longitude = null };
      }
    );
    { old with nurses = newNurses };
  };
};
