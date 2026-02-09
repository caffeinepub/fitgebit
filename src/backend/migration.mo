module {
  type Actor = {
    // Must match the old actor state
  };

  public func run(old : Actor) : Actor {
    // No changes needed, just return old state
    old;
  };
}
