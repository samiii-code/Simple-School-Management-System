/**
 * Convert numeric marks (0-100) to letter grade.
 * Used only in backend; never in frontend.
 */
export const LETTER_GRADES = [
  "A+",
  "A",
  "B+",
  "B",
  "C+",
  "C",
  "D",
  "D-",
  "F",
] as const;

export type LetterGrade = (typeof LETTER_GRADES)[number];

export function marksToLetterGrade(marks: number): LetterGrade {
  if (marks >= 95) return "A+";
  if (marks >= 90) return "A";
  if (marks >= 85) return "B+";
  if (marks >= 80) return "B";
  if (marks >= 75) return "C+";
  if (marks >= 70) return "C";
  if (marks >= 60) return "D";
  if (marks >= 50) return "D-";
  return "F";
}
