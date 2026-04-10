export function parseDurationToMinutes(duration = "") {
  const normalized = String(duration).toLowerCase();
  const hours = parseInt(normalized.match(/(\d+)\s*h/)?.[1] || 0, 10);
  const minutes = parseInt(
    normalized.match(/(\d+)\s*m/)?.[1] || normalized.match(/(\d+)\s*min/)?.[1] || 0,
    10,
  );
  return (hours * 60) + minutes;
}

export function formatMinutesToDuration(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function getCurriculumDuration(sections = []) {
  const totalMinutes = sections.reduce((sum, section) => {
    const lectures = Array.isArray(section?.lectures) ? section.lectures : [];
    const sectionMinutes = lectures.reduce((lectureSum, lecture) => {
      return lectureSum + parseDurationToMinutes(lecture?.duration);
    }, 0);
    return sum + sectionMinutes;
  }, 0);

  return formatMinutesToDuration(totalMinutes);
}

export function getDisplayCourseDuration(course, fallbackSections = []) {
  const courseSections = Array.isArray(course?.sections) && course.sections.length > 0
    ? course.sections
    : fallbackSections;

  const curriculumDuration = getCurriculumDuration(courseSections);
  return curriculumDuration !== "0m" ? curriculumDuration : (course?.duration || "0m");
}
