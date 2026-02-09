import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

// Specify the data migration function in with-clause

actor {
  include MixinStorage();

  let managerRegistrationToken = "admin";
  var isManagerRegistered = false;

  type Language = {
    #english;
    #dutch;
    #french;
  };

  type UserRole = { #manager; #assistant };

  type Avatar = {
    id : Nat;
    name : Text;
    blob : Storage.ExternalBlob;
    description : Text;
  };

  type UserProfile = {
    principal : Principal;
    username : Text;
    role : UserRole;
    language : Language;
    initials : Text;
    profilePicture : ?Storage.ExternalBlob;
    presetAvatarId : ?Nat;
  };

  module TaskFrequency {
    public type TaskFrequency = { #daily; #weekly; #monthly };
  };
  type TaskFrequency = TaskFrequency.TaskFrequency;

  module TaskPreference {
    public type TaskPreference = { #preferred; #hated; #neutral };
  };
  type TaskPreference = TaskPreference.TaskPreference;

  module ToDoTask {
    public type ToDoTask = {
      id : Nat;
      title : Text;
      description : Text;
      frequency : TaskFrequency;
      isWeekly : Bool;
      isPinned : Bool;
      createdBy : Principal;
      completedBy : ?Principal;
      completedByUsername : ?Text;
      completionTimestamp : ?Time.Time;
      createdAt : Time.Time;
      lastCompleted : ?Time.Time;
      evidencePhoto : ?Storage.ExternalBlob;
      completionComment : ?Text;
    };
  };
  type ToDoTask = ToDoTask.ToDoTask;

  module ToDoTaskExtension {
    public func compareByPinnedAndTimestamp(taskA : ToDoTask, taskB : ToDoTask) : Int {
      switch (taskA.isPinned, taskB.isPinned) {
        case (false, true) { 1 };
        case (true, false) { -1 };
        case (_, _) { compareByTimestamp(taskA, taskB) };
      };
    };

    public func compareByTimestamp(taskA : ToDoTask, taskB : ToDoTask) : Int {
      switch (taskB.completionTimestamp, taskA.completionTimestamp) {
        case (null, ?_) { -1 };
        case (?_, null) { 1 };
        case (?timeB, ?timeA) {
          switch (Int.compare(timeA, timeB)) {
            case (#less) { -1 };
            case (#greater) { 1 };
            case (#equal) { 0 };
          };
        };
        case (null, null) {
          switch (Int.compare(taskA.createdAt, taskB.createdAt)) {
            case (#less) { -1 };
            case (#greater) { 1 };
            case (#equal) { 0 };
          };
        };
      };
    };
  };

  module TaskHistoryEntry {
    public type TaskHistoryEntry = {
      id : Nat;
      taskId : Nat;
      action : AuditLogAction;
      userPrincipal : Principal;
      username : Text;
      userInitials : Text;
      userProfilePicture : ?Storage.ExternalBlob;
      userAvatar : ?Avatar;
      timestamp : Time.Time;
      summary : Text;
      evidencePhoto : ?Storage.ExternalBlob;
      completionComment : ?Text;
      completedOnTime : ?Bool;
    };
  };
  type TaskHistoryEntry = TaskHistoryEntry.TaskHistoryEntry;

  module TaskHistoryEntryExtension {
    public func compareByPinnedAndTimestamp(entryA : TaskHistoryEntry, entryB : TaskHistoryEntry) : Int {
      switch (Int.compare(entryB.timestamp, entryA.timestamp)) {
        case (#less) { -1 };
        case (#greater) { 1 };
        case (#equal) { 0 };
      };
    };
  };

  module AuditLogAction {
    public type AuditLogAction = { #taskCreated; #taskUpdated; #taskMarkedDone };
  };
  type AuditLogAction = AuditLogAction.AuditLogAction;

  module AuditLogEntry {
    public type AuditLogEntry = {
      action : AuditLogAction;
      userPrincipal : Principal;
      username : Text;
      timestamp : Time.Time;
      taskId : Nat;
      changeSummary : Text;
    };
  };
  type AuditLogEntry = AuditLogEntry.AuditLogEntry;

  type OvertimeEntry = {
    date : Text;
    minutes : Nat;
    comment : Text;
    isAdd : Bool;
    timestamp : Time.Time;
  };

  module OvertimeEntry {
    public func compareByDate(entryA : OvertimeEntry, entryB : OvertimeEntry) : Int {
      switch (Text.compare(entryA.date, entryB.date)) {
        case (#equal) {
          switch (Int.compare(entryA.timestamp, entryB.timestamp)) {
            case (#less) { -1 };
            case (#greater) { 1 };
            case (#equal) { 0 };
          };
        };
        case (#less) { -1 };
        case (#greater) { 1 };
      };
    };

    public func compareByTimestamp(entryA : OvertimeEntry, entryB : OvertimeEntry) : Int {
      switch (Int.compare(entryA.timestamp, entryB.timestamp)) {
        case (#less) { -1 };
        case (#greater) { 1 };
        case (#equal) { 0 };
      };
    };
  };

  type AssistantRegistrationPayload = {
    username : Text;
    language : Language;
    initials : Text;
    overtime : Nat;
  };

  type ManagerRegistrationPayload = {
    username : Text;
    language : Language;
    initials : Text;
    registrationToken : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let taskState = Map.empty<Nat, ToDoTask>();
  let auditLog = Map.empty<Nat, AuditLogEntry>();
  let overtimeState = Map.empty<Text, List.List<OvertimeEntry>>();
  let notificationState = Map.empty<Principal, Bool>();
  let taskHistory = Map.empty<Nat, List.List<TaskHistoryEntry>>();
  let avatars = Map.empty<Nat, Avatar>();
  var nextTaskId : Nat = 0;
  var nextLogId : Nat = 0;
  var nextAvatarId : Nat = 0;
  var nextTaskHistoryId : Nat = 0;
  let taskPreferences = Map.empty<Text, Map.Map<Nat, TaskPreference>>();
  let hiddenAvatarIds = List.empty<Nat>();

  func isManager(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == #manager };
    };
  };

  func isAssistant(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == #assistant };
    };
  };

  func sanitizeTaskHistoryEntry(entry : TaskHistoryEntry, isManagerCaller : Bool) : TaskHistoryEntry {
    if (isManagerCaller) {
      entry;
    } else {
      {
        entry with
        completedOnTime = null;
      };
    };
  };

  func findProfileByUsername(username : Text) : ?UserProfile {
    for ((_, profile) in userProfiles.entries()) {
      if (Text.equal(profile.username, username)) {
        return ?profile;
      };
    };
    null;
  };

  func getUserDisplayInfo(principal : Principal) : (Text, ?Storage.ExternalBlob, ?Avatar) {
    switch (userProfiles.get(principal)) {
      case (null) { ("", null, null) };
      case (?profile) {
        let avatar = switch (profile.presetAvatarId) {
          case (?avatarId) {
            avatars.get(avatarId);
          };
          case (null) { null };
        };
        (profile.initials, profile.profilePicture, avatar);
      };
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func registerAssistant(payload : AssistantRegistrationPayload) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register");
    };

    switch (userProfiles.get(caller)) {
      case (?existingUser) {
        Runtime.trap("User already registered");
      };
      case null {};
    };

    if (payload.username == "manager") {
      Runtime.trap("Username 'manager' is reserved");
    };

    let role : UserRole = #assistant;

    let assistantProfile : UserProfile = {
      principal = caller;
      username = payload.username;
      role;
      language = payload.language;
      initials = payload.initials;
      profilePicture = null;
      presetAvatarId = null;
    };

    userProfiles.add(caller, assistantProfile);

    let accessControlRole = switch (role) {
      case (#manager) { #admin };
      case (#assistant) { #user };
    };

    AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);
    true;
  };

  public shared ({ caller }) func registerManager(payload : ManagerRegistrationPayload) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register");
    };

    if (isManagerRegistered) {
      Runtime.trap("Manager already registered via local method");
    };

    switch (userProfiles.get(caller)) {
      case (?existingUser) {
        Runtime.trap("User already registered");
      };
      case null {};
    };

    if (payload.registrationToken != managerRegistrationToken) {
      Runtime.trap("Invalid registration token");
    };

    let managerProfile : UserProfile = {
      principal = caller;
      username = payload.username;
      role = #manager;
      language = payload.language;
      initials = payload.initials;
      profilePicture = null;
      presetAvatarId = null;
    };

    userProfiles.add(caller, managerProfile);

    AccessControl.assignRole(accessControlState, caller, caller, #admin);

    isManagerRegistered := true;
    true;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot save profiles");
    };

    if (profile.principal != caller) {
      Runtime.trap("Unauthorized: Cannot save profile for another user");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: User not registered");
      };
      case (?existingProfile) {
        if (existingProfile.role != profile.role) {
          Runtime.trap("Unauthorized: Cannot change your own role in profile");
        };
      };
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func flushUserAccount() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot flush accounts");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("No user profile found to flush") };
      case (?_) { userProfiles.remove(caller) };
    };
  };

  public query ({ caller }) func validateManagerToken(token : Text) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot validate tokens");
    };
    
    if (Text.equal(token, managerRegistrationToken)) {
      true;
    } else {
      false;
    };
  };
};
