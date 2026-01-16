/**
 * Helper function to clean subject names by removing course notation
 * Removes patterns like "- 12°1", "- 12°2", etc. from the end of subject names
 */
export const cleanSubjectName = (name: string): string => {
  // Remove patterns like "- 12°1", "- 12°2", etc.
  return name.replace(/\s*-\s*\d+°\d+\s*$/, '').trim();
};

/**
 * Formats a subject display name with course information
 */
export const formatSubjectWithCourse = (subjectName: string, courseName?: string): string => {
  const cleanName = cleanSubjectName(subjectName);
  return courseName ? `${cleanName} - ${courseName}` : cleanName;
};