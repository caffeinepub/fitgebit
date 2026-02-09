import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
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

  module MigrationTaskFrequency {
    public type TaskFrequency = { #daily; #weekly; #monthly };
  };
  type TaskFrequency = MigrationTaskFrequency.TaskFrequency;

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
      completionTimestamp : ?Int;
      createdAt : Int;
      lastCompleted : ?Int;
      evidencePhoto : ?Storage.ExternalBlob;
      completionComment : ?Text;
    };
  };
  type ToDoTask = ToDoTask.ToDoTask;

  module AuditLogAction {
    public type AuditLogAction = { #taskCreated; #taskUpdated; #taskMarkedDone };
  };
  type AuditLogAction = AuditLogAction.AuditLogAction;

  module AuditLogEntry {
    public type AuditLogEntry = {
      action : AuditLogAction;
      userPrincipal : Principal;
      username : Text;
      timestamp : Int;
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
    timestamp : Int;
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
      timestamp : Int;
      summary : Text;
      evidencePhoto : ?Storage.ExternalBlob;
      completionComment : ?Text;
      completedOnTime : ?Bool;
    };
  };
  type TaskHistoryEntry = TaskHistoryEntry.TaskHistoryEntry;

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    taskState : Map.Map<Nat, ToDoTask>;
    auditLog : Map.Map<Nat, AuditLogEntry>;
    overtimeState : Map.Map<Text, List.List<OvertimeEntry>>;
    notificationState : Map.Map<Principal, Bool>;
    taskHistory : Map.Map<Nat, List.List<TaskHistoryEntry>>;
    avatars : Map.Map<Nat, Avatar>;
    nextTaskId : Nat;
    nextLogId : Nat;
    nextAvatarId : Nat;
    nextTaskHistoryId : Nat;
    taskPreferences : Map.Map<Text, Map.Map<Nat, TaskPreference>>;
    hiddenAvatarIds : List.List<Nat>;
    isManagerRegistered : Bool;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    taskState : Map.Map<Nat, ToDoTask>;
    auditLog : Map.Map<Nat, AuditLogEntry>;
    overtimeState : Map.Map<Text, List.List<OvertimeEntry>>;
    notificationState : Map.Map<Principal, Bool>;
    taskHistory : Map.Map<Nat, List.List<TaskHistoryEntry>>;
    avatars : Map.Map<Nat, Avatar>;
    nextTaskId : Nat;
    nextLogId : Nat;
    nextAvatarId : Nat;
    nextTaskHistoryId : Nat;
    taskPreferences : Map.Map<Text, Map.Map<Nat, TaskPreference>>;
    hiddenAvatarIds : List.List<Nat>;
    isManagerRegistered : Bool;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
