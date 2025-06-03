// ──────────────────────────────────────────────────────────────────────────────
// File: Kuching-ART-Online-System/js/models/Route.js
// ──────────────────────────────────────────────────────────────────────────────

export default class Route {
  constructor(
    routeID,
    routeName,
    startLocation,
    endLocation,
    distance,
    estimatedDuration,
    isActive = true
  ) {
    this.routeID = routeID;
    this.routeName = routeName;
    this.startLocation = startLocation;
    this.endLocation = endLocation;
    this.distance = distance;               // in kilometers
    this.estimatedDuration = estimatedDuration; // in minutes
    this.isActive = isActive;
    this.createdDate = new Date();
    this.lastUpdated = new Date();
  }

  /**
   * Re-create a Route instance from a plain object (JSON from server).
   */
  static fromJSON(data) {
    const route = new Route(
      data.routeID,
      data.routeName,
      data.startLocation,
      data.endLocation,
      data.distance,
      data.estimatedDuration,
      data.isActive
    );
    route.createdDate = new Date(data.createdDate);
    route.lastUpdated = new Date(data.lastUpdated);
    return route;
  }

  /**
   * Fetch all routes from backend and return an array of Route instances.
   * The server now exposes GET /api/routes.
   * If the fetch fails or returns non-OK, we fall back to a small hard-coded list.
   */
  static async getAllRoutes() {
    try {
      const res = await fetch("/api/routes", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const payload = await res.json();
      return payload.map((raw) => Route.fromJSON(raw));
    } catch (err) {
      console.warn(
        "Route.getAllRoutes() failed to fetch /api/routes → returning empty list. Error:",
        err
      );
      // Fallback: a minimal set of sample routes so dropdown is never empty
      return [
        new Route(1, "Kuching→Samarahan", "Kuching", "Samarahan", 30, 45, true),
        new Route(2, "Kuching→Kuantan",  "Kuching", "Kuantan",   330, 240, true),
      ];
    }
  }

  /**
   * Calculates estimated travel time based on conditions (traffic, weather).
   */
  calculateEstimatedTime(conditions = {}) {
    let adjusted = this.estimatedDuration;
    if (conditions.traffic === "heavy") {
      adjusted *= 1.5;
    } else if (conditions.traffic === "light") {
      adjusted *= 0.8;
    }
    if (conditions.weather === "bad") {
      adjusted *= 1.3;
    }
    return Math.round(adjusted);
  }

  /**
   * Validates route data.
   */
  validate() {
    const errors = [];
    if (!this.routeName || typeof this.routeName !== "string") {
      errors.push("Route name is required and must be a string.");
    }
    if (!this.startLocation || typeof this.startLocation !== "string") {
      errors.push("Start location is required and must be a string.");
    }
    if (!this.endLocation || typeof this.endLocation !== "string") {
      errors.push("End location is required and must be a string.");
    }
    if (typeof this.distance !== "number" || this.distance <= 0) {
      errors.push("Distance must be a positive number.");
    }
    if (
      typeof this.estimatedDuration !== "number" ||
      this.estimatedDuration <= 0
    ) {
      errors.push("Estimated duration must be a positive number.");
    }
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Update existing route fields.
   */
  updateRoute(updateData) {
    try {
      if (updateData.routeName) this.routeName = updateData.routeName;
      if (updateData.startLocation) this.startLocation = updateData.startLocation;
      if (updateData.endLocation) this.endLocation = updateData.endLocation;
      if (updateData.distance) this.distance = updateData.distance;
      if (updateData.estimatedDuration)
        this.estimatedDuration = updateData.estimatedDuration;
      if (updateData.isActive !== undefined) this.isActive = updateData.isActive;

      this.lastUpdated = new Date();
      return true;
    } catch (error) {
      console.error("Error updating route:", error);
      return false;
    }
  }
}
