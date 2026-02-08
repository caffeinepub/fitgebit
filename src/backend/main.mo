import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type Language = {
    #english;
    #dutch;
    #french;
  };

  type UserRole = {
    #manager;
    #assistant;
  };

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
    public type TaskFrequency = {
      #daily;
      #weekly;
      #monthly;
    };
  };
  type TaskFrequency = TaskFrequency.TaskFrequency;

  module TaskPreference {
    public type TaskPreference = {
      #preferred;
      #hated;
      #neutral;
    };
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
    public func compareByPinnedAndTimestamp(taskA : ToDoTask, taskB : ToDoTask) : Order.Order {
      switch (taskA.isPinned, taskB.isPinned) {
        case (false, true) { #greater };
        case (true, false) { #less };
        case (false, false) { compareByTimestamp(taskA, taskB) };
        case (true, true) { compareByTimestamp(taskA, taskB) };
      };
    };

    public func compareByTimestamp(taskA : ToDoTask, taskB : ToDoTask) : Order.Order {
      switch (taskB.completionTimestamp, taskA.completionTimestamp) {
        case (null, ?_) { #less };
        case (?_, null) { #greater };
        case (?timeB, ?timeA) {
          Int.compare(timeA, timeB);
        };
        case (null, null) {
          Int.compare(taskA.createdAt, taskB.createdAt);
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
    public func compareByPinnedAndTimestamp(entryA : TaskHistoryEntry, entryB : TaskHistoryEntry) : Order.Order {
      Int.compare(entryB.timestamp, entryA.timestamp);
    };
  };

  module AuditLogAction {
    public type AuditLogAction = {
      #taskCreated;
      #taskUpdated;
      #taskMarkedDone;
    };
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
    public func compareByDate(entryA : OvertimeEntry, entryB : OvertimeEntry) : Order.Order {
      switch (Text.compare(entryA.date, entryB.date)) {
        case (#equal) { Int.compare(entryA.timestamp, entryB.timestamp) };
        case (order) { order };
      };
    };

    public func compareByTimestamp(entryA : OvertimeEntry, entryB : OvertimeEntry) : Order.Order {
      Int.compare(entryA.timestamp, entryB.timestamp);
    };
  };

  type AssistantRegistrationPayload = {
    username : Text;
    language : Language;
    initials : Text;
    overtime : Nat;
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

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
      entry
    } else {
      {
        entry with
        completedOnTime = null
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

  public shared ({ caller }) func createTask(title : Text, description : Text, frequency : TaskFrequency, isWeekly : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create tasks");
    };

    let callerUsername = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile.username };
    };

    if (title.size() == 0) {
      Runtime.trap("Task title is required");
    };

    let task : ToDoTask = {
      id = nextTaskId;
      title;
      description;
      frequency;
      isWeekly;
      createdBy = caller;
      completedBy = null;
      completedByUsername = null;
      completionTimestamp = null;
      createdAt = Time.now();
      lastCompleted = null;
      isPinned = false;
      evidencePhoto = null;
      completionComment = null;
    };

    taskState.add(nextTaskId, task);

    let logEntry : AuditLogEntry = {
      action = #taskCreated;
      userPrincipal = caller;
      username = callerUsername;
      timestamp = Time.now();
      taskId = nextTaskId;
      changeSummary = "Task created: " # title;
    };

    auditLog.add(nextLogId, logEntry);

    let (userInitials, userProfilePicture, userAvatar) = getUserDisplayInfo(caller);

    let taskHistoryEntry : TaskHistoryEntry = {
      id = nextTaskHistoryId;
      taskId = nextTaskId;
      action = #taskCreated;
      userPrincipal = caller;
      username = callerUsername;
      userInitials;
      userProfilePicture;
      userAvatar;
      timestamp = Time.now();
      summary = "Task created: " # title;
      evidencePhoto = null;
      completionComment = null;
      completedOnTime = null;
    };

    let currentTaskHistoryEntries = List.empty<TaskHistoryEntry>();
    currentTaskHistoryEntries.add(taskHistoryEntry);
    taskHistory.add(nextTaskId, currentTaskHistoryEntries);

    nextTaskId += 1;
    nextLogId += 1;
    nextTaskHistoryId += 1;

    nextTaskId - 1;
  };

  public shared ({ caller }) func updateTask(taskId : Nat, title : Text, description : Text, frequency : TaskFrequency, isWeekly : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update tasks");
    };

    let task = switch (taskState.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?t) { t };
    };

    let callerUsername = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile.username };
    };

    if (title.size() == 0) {
      Runtime.trap("Task title is required");
    };

    let updatedTask : ToDoTask = {
      task with
      title;
      description;
      frequency;
      isWeekly;
    };

    taskState.add(taskId, updatedTask);

    let logEntry : AuditLogEntry = {
      action = #taskUpdated;
      userPrincipal = caller;
      username = callerUsername;
      timestamp = Time.now();
      taskId;
      changeSummary = "Task updated: " # title;
    };

    auditLog.add(nextLogId, logEntry);

    let (userInitials, userProfilePicture, userAvatar) = getUserDisplayInfo(caller);

    let taskHistoryEntry : TaskHistoryEntry = {
      id = nextTaskHistoryId;
      taskId;
      action = #taskUpdated;
      userPrincipal = caller;
      username = callerUsername;
      userInitials;
      userProfilePicture;
      userAvatar;
      timestamp = Time.now();
      summary = "Task updated: " # title;
      evidencePhoto = null;
      completionComment = null;
      completedOnTime = null;
    };

    let currentTaskHistoryEntries = switch (taskHistory.get(taskId)) {
      case (null) { List.empty<TaskHistoryEntry>() };
      case (?entries) { entries };
    };
    currentTaskHistoryEntries.add(taskHistoryEntry);
    taskHistory.add(taskId, currentTaskHistoryEntries);

    nextLogId += 1;
    nextTaskHistoryId += 1;
  };

  public shared ({ caller }) func markTaskDone(taskId : Nat, photoData : ?Storage.ExternalBlob, completionComment : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark tasks as done");
    };

    let task = switch (taskState.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?t) { t };
    };

    let callerUsername = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile.username };
    };

    let updatedTask : ToDoTask = {
      task with
      completedBy = ?caller;
      completedByUsername = ?callerUsername;
      completionTimestamp = ?Time.now();
      lastCompleted = ?Time.now();
      evidencePhoto = photoData;
      completionComment;
    };

    taskState.add(taskId, updatedTask);

    let completedOnTime = computeOnTimeCompletion(task);

    let (userInitials, userProfilePicture, userAvatar) = getUserDisplayInfo(caller);

    let taskHistoryEntry : TaskHistoryEntry = {
      id = nextTaskHistoryId;
      taskId;
      action = #taskMarkedDone;
      userPrincipal = caller;
      username = callerUsername;
      userInitials;
      userProfilePicture;
      userAvatar;
      timestamp = Time.now();
      summary = "Task completed: " # task.title;
      evidencePhoto = photoData;
      completionComment;
      completedOnTime;
    };

    let currentTaskHistoryEntries = switch (taskHistory.get(taskId)) {
      case (null) { List.empty<TaskHistoryEntry>() };
      case (?entries) { entries };
    };
    currentTaskHistoryEntries.add(taskHistoryEntry);
    taskHistory.add(taskId, currentTaskHistoryEntries);

    let logEntry : AuditLogEntry = {
      action = #taskMarkedDone;
      userPrincipal = caller;
      username = callerUsername;
      timestamp = Time.now();
      taskId;
      changeSummary = "Task marked as done: " # task.title;
    };

    auditLog.add(nextLogId, logEntry);

    nextLogId += 1;
    nextTaskHistoryId += 1;

    for ((userPrincipal, _) in userProfiles.entries()) {
      if (userPrincipal != caller) {
        notificationState.add(userPrincipal, true);
      };
    };
  };

  public shared ({ caller }) func setTaskPinnedStatus(taskId : Nat, isPinned : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can pin/unpin tasks");
    };

    let task = switch (taskState.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?t) { t };
    };

    let updatedTask : ToDoTask = {
      task with
      isPinned;
    };

    taskState.add(taskId, updatedTask);
  };

  public shared ({ caller }) func setTaskPreference(assistantUsername : Text, taskId : Nat, preference : TaskPreference) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can set task preferences");
    };

    let task = switch (taskState.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?_) { taskId };
    };

    let currentPreferences = switch (taskPreferences.get(assistantUsername)) {
      case (null) {
        let newMap = Map.empty<Nat, TaskPreference>();
        newMap.add(taskId, preference);
        newMap;
      };
      case (?prefs) {
        prefs.add(taskId, preference);
        prefs;
      };
    };

    taskPreferences.add(assistantUsername, currentPreferences);
  };

  public query ({ caller }) func getTaskPreferences(assistantUsername : Text) : async [(Nat, TaskPreference)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can view task preferences");
    };

    switch (taskPreferences.get(assistantUsername)) {
      case (null) { [] };
      case (?prefs) { prefs.toArray() };
    };
  };

  public query ({ caller }) func getAllTasks() : async [ToDoTask] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view tasks");
    };

    let tasksArray = taskState.values().toArray();
    if (tasksArray.size() <= 1) {
      return tasksArray;
    };

    let sortedTasks = mergeSortTasks(tasksArray);
    sortedTasks;
  };

  func mergeSortTasks(tasks : [ToDoTask]) : [ToDoTask] {
    if (tasks.size() <= 1) {
      return tasks;
    };

    let mid = tasks.size() / 2;
    let left = mergeSortTasks(tasks.sliceToArray(0, mid));
    let right = mergeSortTasks(tasks.sliceToArray(mid, tasks.size()));
    mergeTasks(left, right);
  };

  func mergeTasks(left : [ToDoTask], right : [ToDoTask]) : [ToDoTask] {
    var result = List.empty<ToDoTask>();
    var i = 0;
    var j = 0;

    while (i < left.size() and j < right.size()) {
      switch (ToDoTaskExtension.compareByPinnedAndTimestamp(left[i], right[j])) {
        case (#less) {
          result.add(left[i]);
          i += 1;
        };
        case (_) {
          result.add(right[j]);
          j += 1;
        };
      };
    };

    var leftIndex = i;
    while (leftIndex < left.size()) {
      result.add(left[leftIndex]);
      leftIndex += 1;
    };

    var rightIndex = j;
    while (rightIndex < right.size()) {
      result.add(right[rightIndex]);
      rightIndex += 1;
    };

    result.toArray();
  };

  public query ({ caller }) func getTask(taskId : Nat) : async ?ToDoTask {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view tasks");
    };
    taskState.get(taskId);
  };

  public query ({ caller }) func getAuditLog() : async [AuditLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can view audit log");
    };

    auditLog.values().toArray();
  };

  public query ({ caller }) func getAllTaskHistoryEntries() : async [TaskHistoryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view task history");
    };

    let callerIsManager = isManager(caller);

    var allEntries = List.empty<TaskHistoryEntry>();

    for ((_, entries) in taskHistory.entries()) {
      for (entry in entries.values()) {
        allEntries.add(sanitizeTaskHistoryEntry(entry, callerIsManager));
      };
    };

    let sortedEntries = mergeSortTaskHistory(allEntries).toArray();
    sortedEntries;
  };

  func mergeSortTaskHistory(entries : List.List<TaskHistoryEntry>) : List.List<TaskHistoryEntry> {
    let size = entries.size();
    if (size <= 1) {
      return entries;
    };

    let mid = size / 2;
    let left = sliceTaskHistoryEntries(entries, 0, mid);
    let right = sliceTaskHistoryEntries(entries, mid, size);

    mergeTaskHistory(left, right);
  };

  func mergeTaskHistory(left : List.List<TaskHistoryEntry>, right : List.List<TaskHistoryEntry>) : List.List<TaskHistoryEntry> {
    let result = List.empty<TaskHistoryEntry>();
    var leftArray = left.toArray();
    var rightArray = right.toArray();
    var i = 0;
    var j = 0;

    while (i < leftArray.size() and j < rightArray.size()) {
      switch (TaskHistoryEntryExtension.compareByPinnedAndTimestamp(leftArray[i], rightArray[j])) {
        case (#less) {
          result.add(leftArray[i]);
          i += 1;
        };
        case (_) {
          result.add(rightArray[j]);
          j += 1;
        };
      };
    };

    while (i < leftArray.size()) {
      result.add(leftArray[i]);
      i += 1;
    };

    while (j < rightArray.size()) {
      result.add(rightArray[j]);
      j += 1;
    };

    result;
  };

  func sliceTaskHistoryEntries(entries : List.List<TaskHistoryEntry>, start : Nat, end : Nat) : List.List<TaskHistoryEntry> {
    let size = entries.size();
    if (size == 0 or start >= end or end > size) {
      return List.empty<TaskHistoryEntry>();
    };

    let sliceSize = if (end > start) { end - start } else { 0 };
    if (sliceSize == 0) {
      return List.empty<TaskHistoryEntry>();
    };

    let result = List.empty<TaskHistoryEntry>();
    var index = 0;
    var addedCount = 0;

    for (entry in entries.values()) {
      if (index >= start and index < end) {
        result.add(entry);
        addedCount += 1;
      };
      index += 1;
      if (addedCount >= sliceSize) {
        return result;
      };
    };

    result;
  };

  public query ({ caller }) func getTaskHistory(taskId : Nat) : async [TaskHistoryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view task history");
    };

    let callerIsManager = isManager(caller);

    switch (taskHistory.get(taskId)) {
      case (null) { [] };
      case (?entries) {
        let sanitizedEntries = entries.map<TaskHistoryEntry, TaskHistoryEntry>(
          func(entry) {
            sanitizeTaskHistoryEntry(entry, callerIsManager)
          }
        );
        sanitizedEntries.reverse().toArray();
      };
    };
  };

  public query ({ caller }) func getAllTaskHistory() : async [TaskHistoryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view task history");
    };

    let callerIsManager = isManager(caller);

    let taskHistoryArray = taskHistory.toArray();
    if (taskHistoryArray.size() == 0) {
      return [];
    };

    var allEntries = List.empty<TaskHistoryEntry>();

    for ((_, entries) in taskHistoryArray.values()) {
      for (entry in entries.values()) {
        allEntries.add(sanitizeTaskHistoryEntry(entry, callerIsManager));
      };
    };

    allEntries.reverse().toArray();
  };

  public shared ({ caller }) func registerAssistant(payload : AssistantRegistrationPayload) : async () {
    switch (userProfiles.get(caller)) {
      case (?existingUser) {
        Runtime.trap("User already registered");
      };
      case null {};
    };

    if (payload.username == "manager") {
      Runtime.trap("Username 'manager' is reserved");
    };

    for ((_, profile) in userProfiles.entries()) {
      if (Text.equal(profile.username, payload.username)) {
        Runtime.trap("Username already taken");
      };
    };

    let role : UserRole = if (Text.equal(payload.initials, "YK") and payload.overtime == 696969) {
      #manager;
    } else {
      #assistant;
    };

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
  };

  func determineRole(_username : Text) : UserRole {
    #assistant;
  };

  public shared ({ caller }) func logOvertime(date : Text, minutes : Nat, comment : Text, isAdd : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can log overtime");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (profile.role == #manager) {
      Runtime.trap("Managers cannot log overtime");
    };

    if (minutes == 0) {
      Runtime.trap("Cannot log 0 minutes");
    };

    let entry : OvertimeEntry = {
      date;
      minutes;
      comment;
      isAdd;
      timestamp = Time.now();
    };

    let currentEntries = switch (overtimeState.get(profile.username)) {
      case (null) { List.empty<OvertimeEntry>() };
      case (?entries) { entries };
    };

    currentEntries.add(entry);

    overtimeState.add(profile.username, currentEntries);

    for ((userPrincipal, userProfile) in userProfiles.entries()) {
      if (userProfile.role == #manager) {
        notificationState.add(userPrincipal, true);
      };
    };
  };

  public shared query ({ caller }) func getOvertimeEntries(username : Text) : async [OvertimeEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view entries");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (callerProfile.role != #manager and not Text.equal(callerProfile.username, username)) {
      Runtime.trap("Unauthorized: Can only view your own overtime entries");
    };

    switch (overtimeState.get(username)) {
      case (null) { [] };
      case (?entries) {
        entries.reverse().toArray();
      };
    };
  };

  public shared query ({ caller }) func getAllAssistants() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can view all assistants");
    };

    userProfiles.values().toArray().filter(
      func(profile) {
        profile.role == #assistant;
      }
    );
  };

  public shared ({ caller }) func checkManagerNotifications() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can check notifications");
    };

    let hasNotification = switch (notificationState.get(caller)) {
      case (null) { false };
      case (?exists) { exists };
    };

    if (hasNotification) {
      notificationState.add(caller, false);
    };

    hasNotification;
  };

  public type OvertimeTotals = {
    totalDays : Nat;
    totalHours : Nat;
    totalMinutes : Nat;
  };

  public shared query ({ caller }) func getOvertimeTotals(username : Text) : async OvertimeTotals {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view totals");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (callerProfile.role != #manager and not Text.equal(callerProfile.username, username)) {
      Runtime.trap("Unauthorized: Can only view your own overtime totals");
    };

    let entries = switch (overtimeState.get(username)) {
      case (null) { List.empty<OvertimeEntry>() };
      case (?entries) { entries };
    };

    let totalMinutes = entries.foldRight(
      0,
      func(entry, minutes) {
        if (entry.isAdd) {
          minutes + entry.minutes;
        } else {
          minutes;
        };
      },
    );
    let totalTime = convertToTotalTime(totalMinutes);

    toOvertimeTotals(totalTime);
  };

  public shared ({ caller }) func deleteAssistantData(assistantPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can delete assistant data");
    };

    let assistantProfile = switch (userProfiles.get(assistantPrincipal)) {
      case (null) { Runtime.trap("No assistant with principal " # assistantPrincipal.toText() # " found.") };
      case (?profile) { profile };
    };

    if (assistantProfile.role != #assistant) {
      Runtime.trap("Can only delete assistant data, not manager data");
    };

    userProfiles.remove(assistantPrincipal);
    overtimeState.remove(assistantProfile.username);
    notificationState.remove(assistantPrincipal);
    taskPreferences.remove(assistantProfile.username);
  };

  public shared ({ caller }) func resetUsersAndClearOrphanedState(clearTasks : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset users");
    };

    userProfiles.clear();
    overtimeState.clear();
    notificationState.clear();
    taskPreferences.clear();

    if (clearTasks) {
      taskState.clear();
      taskHistory.clear();
      auditLog.clear();
      nextTaskId := 0;
      nextLogId := 0;
      nextTaskHistoryId := 0;
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    if (caller != user and not isManager(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    if (profile.principal != caller) {
      Runtime.trap("Unauthorized: Can only save your own profile");
    };

    let expectedRole = determineRole(profile.username);
    if (profile.role != expectedRole) {
      Runtime.trap("Invalid role for username: username 'Jay' must have manager role, all others must have assistant role");
    };

    let isFirstUser = userProfiles.isEmpty();

    if (isFirstUser and profile.role != #manager) {
      Runtime.trap("First user must be a manager");
    };

    if (not isFirstUser and profile.role == #manager) {
      let existingProfile = userProfiles.get(caller);
      switch (existingProfile) {
        case (?existing) {
          if (existing.role != #manager) {
            Runtime.trap("Cannot change role to manager");
          };
        };
        case (null) {
          if (not Text.equal(profile.username, "Jay")) {
            Runtime.trap("Cannot assign manager role to new user when users already exist");
          };
        };
      };
    };

    if (Text.equal(profile.username, "manager")) {
      Runtime.trap("Username 'manager' is reserved");
    };

    let existingProfile = userProfiles.get(caller);
    switch (existingProfile) {
      case (?existing) {
        if (not Text.equal(existing.username, profile.username)) {
          for ((principal, otherProfile) in userProfiles.entries()) {
            if (principal != caller and Text.equal(otherProfile.username, profile.username)) {
              Runtime.trap("Username already taken");
            };
          };
        };
      };
      case (null) {
        for ((_, otherProfile) in userProfiles.entries()) {
          if (Text.equal(otherProfile.username, profile.username)) {
            Runtime.trap("Username already taken");
          };
        };
      };
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func uploadProfilePicture(content : Storage.ExternalBlob) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload profile pictures");
    };
    content;
  };

  public shared ({ caller }) func setPresetAvatar(avatarId : Nat) : async Avatar {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set preset avatars");
    };

    let unlockedAvatarCount = calculateUnlockedAvatars();
    if (avatarId >= unlockedAvatarCount) {
      Runtime.trap("Avatar is not unlocked yet");
    };

    switch (avatars.get(avatarId)) {
      case (null) { Runtime.trap("Avatar with id " # avatarId.toText() # " does not exist") };
      case (?avatar) { avatar };
    };
  };

  func calculateUnlockedAvatars() : Nat {
    let startTimestamp : Nat = 1717266587357012000;
    let secondsPerMonth : Nat = 30 * 24 * 60 * 60;
    let monthsPassed : Nat = startTimestamp / secondsPerMonth;
    let totalUnlocked : Nat = monthsPassed + 8;

    if (totalUnlocked > 14) {
      return 14;
    };
    if (totalUnlocked < 8) {
      return 8;
    };
    totalUnlocked;
  };

  public query ({ caller }) func getUnlockedAvatars() : async [Avatar] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view avatars");
    };

    let unlockedAvatarCount = calculateUnlockedAvatars();
    let allAvatarsArray = avatars.values().toArray();

    let filteredAvatars = allAvatarsArray.filter(
      func(avatar) {
        avatar.id < unlockedAvatarCount;
      }
    );

    filteredAvatars;
  };

  public shared ({ caller }) func uploadAvatar(name : Text, description : Text, content : Storage.ExternalBlob) : async Avatar {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can upload custom avatars");
    };

    let avatar : Avatar = {
      id = nextAvatarId;
      name;
      blob = content;
      description;
    };

    avatars.add(avatar.id, avatar);
    nextAvatarId += 1;

    switch (avatars.get(avatar.id)) {
      case (null) { Runtime.trap("Critical failure: Uploaded avatar not found in test run. ") };
      case (?avatar) { avatar };
    };
  };

  func convertToTotalTime(totalMinutes : Nat) : (Nat, Nat, Nat) {
    let totalHours = totalMinutes / 60;
    let remainingMinutes = totalMinutes % 60;
    let totalDays = totalHours / 8;
    let remainingHours = totalHours % 8;
    (totalDays, remainingHours, remainingMinutes);
  };

  func toOvertimeTotals(time : (Nat, Nat, Nat)) : OvertimeTotals {
    let (totalDays, totalHours, totalMinutes) = time;
    {
      totalDays;
      totalHours;
      totalMinutes;
    };
  };

  type AssistantTaskSummary = {
    username : Text;
    totalTasks : Nat;
    completedTasks : Nat;
    onTimeTasks : Nat;
    dailyTasks : Nat;
    weeklyTasks : Nat;
    monthlyTasks : Nat;
    taskPreferences : [(Nat, TaskPreference)];
  };

  type AssistantTaskCompletionRecord = {
    taskId : Nat;
    taskTitle : Text;
    frequency : TaskFrequency;
    completionTimestamp : Time.Time;
    completedOnTime : Bool;
  };

  type AssistantTaskHabits = {
    summary : AssistantTaskSummary;
    completions : [AssistantTaskCompletionRecord];
  };

  public shared query ({ caller }) func getAssistantTaskHabits(username : Text) : async AssistantTaskHabits {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can view assistant task habits");
    };

    let completions = getAssistantTaskCompletions(username);
    let summary = getAssistantTaskSummary(username, completions);

    {
      summary;
      completions;
    };
  };

  func getAssistantTaskCompletions(username : Text) : [AssistantTaskCompletionRecord] {
    let entries = List.empty<AssistantTaskCompletionRecord>();

    for ((_, taskHistoryEntries) in taskHistory.entries()) {
      for (entry in taskHistoryEntries.values()) {
        if (entry.username == username and entry.action == #taskMarkedDone and entry.completedOnTime != null) {
          entries.add({
            taskId = entry.taskId;
            taskTitle = getTaskTitle(entry.taskId);
            frequency = getTaskFrequency(entry.taskId);
            completionTimestamp = entry.timestamp;
            completedOnTime = switch (entry.completedOnTime) {
              case (?value) { value };
              case (null) { false };
            };
          });
        };
      };
    };

    entries.toArray();
  };

  func getTaskTitle(taskId : Nat) : Text {
    switch (taskState.get(taskId)) {
      case (?task) { task.title };
      case (null) { "" };
    };
  };

  func getTaskFrequency(taskId : Nat) : TaskFrequency {
    switch (taskState.get(taskId)) {
      case (?task) { task.frequency };
      case (null) { #daily };
    };
  };

  func getAssistantTaskSummary(username : Text, completions : [AssistantTaskCompletionRecord]) : AssistantTaskSummary {
    let dailyTasks = countTasksByFrequency(#daily);
    let weeklyTasks = countTasksByFrequency(#weekly);
    let monthlyTasks = countTasksByFrequency(#monthly);

    let taskPreferencesArray = switch (taskPreferences.get(username)) {
      case (null) { [] };
      case (?prefs) { prefs.toArray() };
    };

    let (completedTasks, onTimeTasks) = completions.foldLeft(
      (0, 0),
      func((completed, onTime), record) {
        let onTimeCount = if (record.completedOnTime) { onTime + 1 } else { onTime };
        (completed + 1, onTimeCount);
      },
    );

    {
      username;
      totalTasks = taskState.size();
      completedTasks;
      onTimeTasks;
      dailyTasks;
      weeklyTasks;
      monthlyTasks;
      taskPreferences = taskPreferencesArray;
    };
  };

  func countTasksByFrequency(frequency : TaskFrequency) : Nat {
    let tasks = taskState.toArray();
    let filteredTasks = tasks.filter(
      func((_, task)) {
        task.frequency == frequency;
      }
    );
    filteredTasks.size();
  };

  func computeOnTimeCompletion(task : ToDoTask) : ?Bool {
    let lastCompleted = task.lastCompleted;

    if (lastCompleted == null) {
      return ?true;
    };

    let frequency = task.frequency;
    let completionTime = switch (task.completionTimestamp) {
      case (?timestamp) { timestamp };
      case (null) { return null };
    };

    switch (frequency) {
      case (#daily) { ?isOnTimeDaily(completionTime, lastCompleted) };
      case (#weekly) { ?isOnTimeWeekly(completionTime, lastCompleted) };
      case (#monthly) { ?isOnTimeMonthly(completionTime, lastCompleted) };
    };
  };

  func isOnTimeDaily(completionTime : Time.Time, lastCompleted : ?Time.Time) : Bool {
    let lastCompletionTime = switch (lastCompleted) {
      case (?time) { time };
      case (null) { return false };
    };

    let diff = completionTime - lastCompletionTime;
    diff < 48 * 60 * 60 * 1_000_000_000;
  };

  func isOnTimeWeekly(completionTime : Time.Time, lastCompleted : ?Time.Time) : Bool {
    let lastCompletionTime = switch (lastCompleted) {
      case (?time) { time };
      case (null) { return false };
    };

    let diff = completionTime - lastCompletionTime;
    diff < 8 * 24 * 60 * 60 * 1_000_000_000;
  };

  func isOnTimeMonthly(completionTime : Time.Time, lastCompleted : ?Time.Time) : Bool {
    let lastCompletionTime = switch (lastCompleted) {
      case (?time) { time };
      case (null) { return false };
    };

    let diff = completionTime - lastCompletionTime;
    diff < 32 * 24 * 60 * 60 * 1_000_000_000;
  };

  public shared ({ caller }) func editLatestOvertimeEntry(username : Text, newEntry : OvertimeEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can edit overtime entries");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let targetProfile = switch (findProfileByUsername(username)) {
      case (null) { Runtime.trap("Target user not found") };
      case (?profile) { profile };
    };

    if (targetProfile.role != #assistant) {
      Runtime.trap("Can only edit overtime entries for assistants");
    };

    if (callerProfile.role == #manager) {
    } else if (Text.equal(callerProfile.username, username)) {
    } else {
      Runtime.trap("Unauthorized: Can only edit your own overtime entries");
    };

    let entries = switch (overtimeState.get(username)) {
      case (null) { Runtime.trap("No entries found for user") };
      case (?entries) { entries };
    };

    if (entries.isEmpty()) {
      Runtime.trap("No entries found for user");
    };

    var maxTimestamp : Time.Time = entries.at(0).timestamp;
    var latestEntryIndex : Int = 0;

    var index : Int = 0;
    for (entry in entries.values()) {
      if (entry.timestamp > maxTimestamp) {
        maxTimestamp := entry.timestamp;
        latestEntryIndex := index;
      };
      index += 1;
    };

    let entriesArray = entries.toArray();
    if (Int.abs(latestEntryIndex) >= entriesArray.size()) {
      Runtime.trap("Critical failure: Index for latest entry out of bounds");
    };

    let oldEntry = entriesArray[Int.abs(latestEntryIndex)];
    let updatedEntries = entries.map<OvertimeEntry, OvertimeEntry>(
      func(entry) {
        if (entry.timestamp == oldEntry.timestamp) {
          newEntry;
        } else {
          entry;
        };
      }
    );

    overtimeState.add(username, updatedEntries);
  };

  public query ({ caller }) func getUnlockedAvatarIds() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view unlocked avatar IDs");
    };
    hiddenAvatarIds.toArray();
  };

  public query ({ caller }) func getAllAvatars() : async [Avatar] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view all avatars");
    };

    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can view all avatars");
    };

    avatars.values().toArray();
  };

  public shared ({ caller }) func wipeStorage() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform a full reset");
    };

    taskState.clear();
    auditLog.clear();
    overtimeState.clear();
    notificationState.clear();
    taskHistory.clear();
    avatars.clear();
    nextTaskId := 0;
    nextLogId := 0;
    nextAvatarId := 0;
    nextTaskHistoryId := 0;
    taskPreferences.clear();
    hiddenAvatarIds.clear();
  };
};
