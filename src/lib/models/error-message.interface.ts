/**
 * In most cases this will be the part of the error message that will appear after the field label.
 *
 * {{label}} is required.
 *
 * Date component will subsitute '{label}' for the label in the component.
 * Ex. { required: '{label} is required.' }
 *
 * Note: '{label}' is exported in constant 'LabelReplacementTag'.
 */
export const LabelReplacementTag = '{label}';
export interface ErrorMessage {
  required: string;
  [key: string]: string;
}

/**
 * Messages that several components declare identically. They are constants so
 * the wording is changed in one place, not eleven.
 *
 * CountryComponent deliberately does NOT use RequiredMsg: its message carries
 * no label tag, and that difference is visible to consumers.
 */
export const RequiredMsg = `${LabelReplacementTag} is required.`;
export const InvalidMsg = `${LabelReplacementTag} is invalid.`;
export const DuplicateMsg = `${LabelReplacementTag} was already used for another family member.`;

/**
 * The region-name character rule, shared verbatim by ProvinceComponent and
 * CountryComponent. Province renders it behind the label tag; country renders
 * it bare. Keeping the sentence here means the two cannot drift apart.
 */
export const RegionCharsMsg =
  'must contain letters and may include special characters such as hyphens, periods, apostrophes and blank characters.';

// To catch all occurances of the label tag in the message
const regExpLabel = new RegExp(LabelReplacementTag, 'g');

// Function only used with library
export function replaceLabelTag(str: string, value: string) {
  return str.replace(regExpLabel, value);
}
