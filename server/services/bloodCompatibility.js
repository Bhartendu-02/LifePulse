/**
 * Blood Compatibility Engine
 * Encapsulates the clinical immunohematology rules for Red Blood Cell (RBC) compatibility.
 * 
 * MEDICAL EXPLANATION:
 * 1. AB+ is the UNIVERSAL RECIPIENT:
 *    AB+ red cells have both A and B antigens, and the Rh(D) factor. Therefore, their plasma
 *    contains NO anti-A, anti-B, or anti-Rh antibodies. They can safely receive red blood cells
 *    from all 8 blood groups without causing hemolytic transfusion reactions.
 * 
 * 2. O- is the UNIVERSAL DONOR:
 *    O- red cells lack A, B, and Rh antigens. Because they present no foreign surface markers,
 *    they will not be attacked by antibodies in any recipient's blood. However, an O- patient's
 *    plasma contains anti-A, anti-B, and anti-Rh antibodies—meaning an O- patient can ONLY receive
 *    from another O- donor.
 */

const COMPATIBILITY_RULES = {
  'O-':  ['O-'],
  'O+':  ['O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
};

/**
 * Returns an array of blood groups compatible with the given patient blood group.
 * @param {string} patientGroup - The patient's blood group (e.g. "B+")
 * @returns {string[]} Array of compatible donor blood groups
 */
function getCompatibleGroups(patientGroup) {
  if (!patientGroup || typeof patientGroup !== 'string') {
    throw new Error('Invalid blood group');
  }

  const normalizedGroup = patientGroup.trim().toUpperCase();
  const compatible = COMPATIBILITY_RULES[normalizedGroup];

  if (!compatible) {
    throw new Error(`Invalid blood group: ${patientGroup}`);
  }

  return compatible;
}

module.exports = {
  COMPATIBILITY_RULES,
  getCompatibleGroups
};
