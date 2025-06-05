/**
 * Validates a course’s subscription object, including:
 *  • Both isFree and isPro can be false, but cannot both be true.
 *  • No duplicate plans with the same (type, duration).
 *
 * Expected shape:
 * {
 *   isFree: boolean,
 *   isPro: boolean,
 *   plans: Array<{
 *     discountInPercent: string (integer 0–100),
 *     duration: string (integer > 0),
 *     priceWithTax: string (number ≥ 0),
 *     type: "MONTHLY" | "YEARLY"
 *   }>
 * }
 *
 * @param {any} subscription - The raw subscription data to validate.
 * @returns {{
 *   valid: boolean,
 *   errors: Array<{ path: string, message: string }>
 * }}
 */
export function validateSubscription(subscription) {
  const errors = [];

  // 1) Top‐level must be a non‐null object
  if (
    typeof subscription !== "object" ||
    subscription === null ||
    Array.isArray(subscription)
  ) {
    errors.push({
      path: "subscription",
      message: "Subscription must be a non‐null object",
    });
    return { valid: false, errors };
  }

  // 2) Check isFree
  if (typeof subscription.isFree !== "boolean") {
    errors.push({
      path: "subscription.isFree",
      message: "`isFree` must be a boolean",
    });
  }

  // 3) Check isPro
  if (typeof subscription.isPro !== "boolean") {
    errors.push({
      path: "subscription.isPro",
      message: "`isPro` must be a boolean",
    });
  }

  // 4) Both cannot be true simultaneously
  if (subscription.isFree === true && subscription.isPro === true) {
    errors.push({
      path: "subscription.isFree / subscription.isPro",
      message: "`isFree` and `isPro` cannot both be true at the same time.",
    });
  }

  // 5) Check plans is an array
  if (!Array.isArray(subscription.plans)) {
    errors.push({
      path: "subscription.plans",
      message: "`plans` must be an array",
    });
    return { valid: false, errors };
  }

  // 6) Validate each plan’s fields
  subscription.plans.forEach((plan, index) => {
    const basePath = `subscription.plans[${index}]`;

    // 6a) Must be a non‐null object
    if (typeof plan !== "object" || plan === null || Array.isArray(plan)) {
      errors.push({
        path: basePath,
        message: "Each plan must be a non‐null object",
      });
      return;
    }

    // 6b) discountInPercent: string representing integer 0–100
    if (typeof plan.discountInPercent !== "string") {
      errors.push({
        path: `${basePath}.discountInPercent`,
        message: "`discountInPercent` must be a string",
      });
    } else {
      const disc = Number(plan.discountInPercent);
      if (!Number.isInteger(disc) || disc < 0 || disc > 100) {
        errors.push({
          path: `${basePath}.discountInPercent`,
          message:
            "`discountInPercent` must be an integer string between 0 and 100",
        });
      }
    }

    // 6c) duration: string representing integer > 0
    if (typeof plan.duration !== "string") {
      errors.push({
        path: `${basePath}.duration`,
        message: "`duration` must be a string",
      });
    } else {
      const dur = Number(plan.duration);
      if (!Number.isInteger(dur) || dur <= 0) {
        errors.push({
          path: `${basePath}.duration`,
          message:
            "`duration` must be a string representing a positive integer",
        });
      }
    }

    // 6d) priceWithTax: string representing number ≥ 0
    if (typeof plan.priceWithTax !== "string") {
      errors.push({
        path: `${basePath}.priceWithTax`,
        message: "`priceWithTax` must be a string",
      });
    } else {
      const price = Number(plan.priceWithTax);
      if (Number.isNaN(price) || price < 0) {
        errors.push({
          path: `${basePath}.priceWithTax`,
          message:
            "`priceWithTax` must be a string representing a non‐negative number",
        });
      }
    }

    // 6e) type: must be "MONTHLY" or "YEARLY"
    if (typeof plan.type !== "string") {
      errors.push({
        path: `${basePath}.type`,
        message: "`type` must be a string",
      });
    } else {
      const t = plan.type.trim().toUpperCase();
      if (!["MONTHLY", "YEARLY"].includes(t)) {
        errors.push({
          path: `${basePath}.type`,
          message: '`type` must be either "MONTHLY" or "YEARLY"',
        });
      }
    }
  });

  // 7) Check for duplicates: no two plans with same (type, duration)
  const seen = new Map();
  subscription.plans.forEach((plan, index) => {
    // Skip if type/duration were invalid (we rely on prior checks)
    if (typeof plan.type !== "string" || typeof plan.duration !== "string") {
      return;
    }
    const typeKey = plan.type.trim().toUpperCase();
    const durKey = plan.duration.trim();
    if (!["MONTHLY", "YEARLY"].includes(typeKey)) {
      return;
    }
    const durNum = Number(durKey);
    if (!Number.isInteger(durNum) || durNum <= 0) {
      return;
    }

    const compositeKey = `${typeKey}|${durKey}`;
    if (seen.has(compositeKey)) {
      const firstIndex = seen.get(compositeKey);
      errors.push({
        path: `subscription.plans[${index}]`,
        message: `Duplicate plan detected: same type="${typeKey}" and duration="${durKey}" as plans[${firstIndex}]`,
      });
    } else {
      seen.set(compositeKey, index);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Takes an array of plan‐objects and returns a *new* array
 * sorted by [type → duration].  Type priority is defined as:
 *    MONTHLY  → index 0
 *    YEARLY   → index 1
 * Any unknown type will be treated as “after” both MONTHLY and YEARLY.
 *
 * @param {Array<{
 *   discountInPercent: string,
 *   duration: string,
 *   priceWithTax: string,
 *   type: string
 * }>} plans
 * @returns {Array}  a newly sorted array of plans
 */
export function sortSubscriptionPlans(plans) {
  console.log("plans", plans);
  // Define the order for known types:
  const typeOrder = {
    MONTHLY: 0,
    YEARLY: 1,
  };

  // Return a new array (copy + sort)
  return [...plans].sort((a, b) => {
    // 1) Compare types (case‐insensitive)
    const ta = typeOrder[a.type.toUpperCase()] ?? 2;
    const tb = typeOrder[b.type.toUpperCase()] ?? 2;
    if (ta !== tb) {
      return ta - tb;
    }

    // 2) Same type → compare duration as number
    const da = parseInt(a.duration, 10);
    const db = parseInt(b.duration, 10);
    if (!Number.isNaN(da) && !Number.isNaN(db)) {
      return da - db;
    }

    // 3) Fallback: preserve original insertion if parsing failed
    return 0;
  });
}
