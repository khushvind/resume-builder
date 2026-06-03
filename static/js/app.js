// Main frontend logic for the Resume Builder
// This file is the extracted version of the inline script from templates/index.html
// It expects window.DEFAULTS to be set before this script is loaded.

const defaults = window.DEFAULTS || {};

const ids = {};

function $(id) {
  return document.getElementById(id);
}

function initIds() {
  Object.assign(ids, {
    name: $("name"),
    course: $("course"),
    branch: $("branch"),
    phone: $("phone"),
    email: $("email"),
    linkedin: $("linkedin"),
    github: $("github"),
    showPhone: $("show-phone"),
    showEmail: $("show-email"),
    showLinkedin: $("show-linkedin"),
    showGithub: $("show-github"),
    academicEntries: $("academic-entries"),
    experience: $("experience"),
    internships: $("internships"),
    experienceEntries: $("experience-entries"),
    internshipEntries: $("internships-entries"),
    projectEntries: $("project-entries"),
    skillsLanguages: $("skills-languages"),
    skillsLibraries: $("skills-libraries"),
    skillsTools: $("skills-tools"),
    showAcademic: $("show-academic"),
    showExperience: $("show-experience"),
    showInternships: $("show-internships"),
    showProjects: $("show-projects"),
    showSkills: $("show-skills"),
    form: $("resume-form"),
    frame: $("pdf-frame"),
    status: $("status"),
    error: $("error-box"),
    download: $("download-link"),
    renderTop: $("render-top"),
  });
}

function createPointRow(value = "") {
  const row = document.createElement("div");
  row.className = "point-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "point-input";
  input.value = value;
  input.placeholder = "Point";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "row-remove";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", "Remove point");
  removeButton.addEventListener("click", () => row.remove());

  row.append(input, removeButton);
  return row;
}

function createEntryCard(section, entry = {}) {
  const card = document.createElement("div");
  card.className = "entry-card";
  card.dataset.section = section;

  const header = document.createElement("div");
  header.className = "entry-card-header";

  if (section === "academic") {
    const yearField = document.createElement("label");
    yearField.className = "entry-field";
    const yearSpan = document.createElement("span");
    yearSpan.textContent = "Year";
    const yearInput = document.createElement("input");
    yearInput.type = "text";
    yearInput.className = "entry-input";
    yearInput.value = entry.year || "";
    yearInput.placeholder = "2024";
    yearField.append(yearSpan, yearInput);

    const degreeField = document.createElement("label");
    degreeField.className = "entry-field";
    const degreeSpan = document.createElement("span");
    degreeSpan.textContent = "Degree";
    const degreeInput = document.createElement("input");
    degreeInput.type = "text";
    degreeInput.className = "entry-input";
    degreeInput.value = entry.degree || "";
    degreeInput.placeholder = "B.Sc / M.Sc / B.Tech";
    degreeField.append(degreeSpan, degreeInput);

    const instField = document.createElement("label");
    instField.className = "entry-field";
    const instSpan = document.createElement("span");
    instSpan.textContent = "Institute";
    const instInput = document.createElement("input");
    instInput.type = "text";
    instInput.className = "entry-input";
    instInput.value = entry.institute || "";
    instInput.placeholder = "College / University";
    instField.append(instSpan, instInput);

    const marksField = document.createElement("label");
    marksField.className = "entry-field";
    const marksSpan = document.createElement("span");
    marksSpan.textContent = "Marks";
    const marksInput = document.createElement("input");
    marksInput.type = "text";
    marksInput.className = "entry-input";
    marksInput.value = entry.marks || "";
    marksInput.placeholder = "GPA / Percentage";
    marksField.append(marksSpan, marksInput);

    header.append(yearField, degreeField, instField, marksField);
  } else if (section === "experience" || section === "internships") {
    const titleField = document.createElement("label");
    titleField.className = "entry-field";
    const titleSpan = document.createElement("span");
    titleSpan.textContent = "Company";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "entry-input";
    titleInput.value = entry.title || "";
    titleInput.placeholder = "Company / Organization";
    titleField.append(titleSpan, titleInput);

    const roleField = document.createElement("label");
    roleField.className = "entry-field";
    const roleSpan = document.createElement("span");
    roleSpan.textContent = "Role";
    const roleInput = document.createElement("input");
    roleInput.type = "text";
    roleInput.className = "entry-input";
    roleInput.value = entry.role || "";
    roleInput.placeholder = "Role / Title";
    roleField.append(roleSpan, roleInput);

    const durationField = document.createElement("label");
    durationField.className = "entry-field";
    const durationSpan = document.createElement("span");
    durationSpan.textContent = "Duration";
    const durationInput = document.createElement("input");
    durationInput.type = "text";
    durationInput.className = "entry-input";
    durationInput.value = entry.duration || "";
    durationInput.placeholder = "(Jan 2025 - Present)";
    durationField.append(durationSpan, durationInput);

    header.append(titleField, roleField, durationField);
  } else {
    const titleField = document.createElement("label");
    titleField.className = "entry-field";
    const titleSpan = document.createElement("span");
    titleSpan.textContent = "Project Name";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "entry-input";
    titleInput.value = entry.title || "";
    titleInput.placeholder = "Project name";
    titleField.append(titleSpan, titleInput);

    const subtitleField = document.createElement("label");
    subtitleField.className = "entry-field";
    const subtitleSpan = document.createElement("span");
    subtitleSpan.textContent = "Subtitle";
    const subtitleInput = document.createElement("input");
    subtitleInput.type = "text";
    subtitleInput.className = "entry-input";
    subtitleInput.value = entry.subtitle || "";
    subtitleInput.placeholder = "Short descriptor";
    subtitleField.append(subtitleSpan, subtitleInput);

    const durationField = document.createElement("label");
    durationField.className = "entry-field";
    const durationSpan = document.createElement("span");
    durationSpan.textContent = "Duration";
    const durationInput = document.createElement("input");
    durationInput.type = "text";
    durationInput.className = "entry-input";
    durationInput.value = entry.duration || "";
    durationInput.placeholder = "(Jan 2025 - Mar 2025)";
    durationField.append(durationSpan, durationInput);

    const urlField = document.createElement("label");
    urlField.className = "entry-field";
    const urlSpan = document.createElement("span");
    urlSpan.textContent = "Github URL";
    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.className = "entry-input";
    urlInput.value = entry.url || "";
    urlInput.placeholder = "https://...";
    urlField.append(urlSpan, urlInput);

    header.append(titleField, subtitleField, durationField, urlField);
  }

  let pointsBox = null;
  if (section !== "academic") {
    pointsBox = document.createElement("div");
    pointsBox.className = "points-box";

    const pointsHeader = document.createElement("div");
    pointsHeader.className = "points-header";
    const pointsTitle = document.createElement("span");
    pointsTitle.textContent = "Points";
    const addPointButton = document.createElement("button");
    addPointButton.type = "button";
    addPointButton.className = "point-add";
    addPointButton.textContent = "+";
    addPointButton.setAttribute("aria-label", "Add point");
    pointsHeader.append(pointsTitle, addPointButton);

    const pointsList = document.createElement("div");
    pointsList.className = "points-list";

    const pointValues = Array.isArray(entry.points) && entry.points.length ? entry.points : [""];
    pointValues.forEach((point) => pointsList.append(createPointRow(point)));

    addPointButton.addEventListener("click", () => {
      pointsList.append(createPointRow());
    });

    pointsBox.append(pointsHeader, pointsList);
  }

  const cardActions = document.createElement("div");
  cardActions.className = "entry-actions";
  const removeEntryButton = document.createElement("button");
  removeEntryButton.type = "button";
  removeEntryButton.className = "entry-remove";
  removeEntryButton.textContent = "Remove";
  removeEntryButton.addEventListener("click", () => card.remove());
  cardActions.append(removeEntryButton);

  if (pointsBox) card.append(header, pointsBox, cardActions);
  else card.append(header, cardActions);
  return card;
}

function renderEntrySection(section, rows) {
  let container = null;
  if (section === "experience") container = ids.experienceEntries;
  else if (section === "internships") container = ids.internshipEntries;
  else if (section === "projects") container = ids.projectEntries;
  else if (section === "academic") container = ids.academicEntries;
  if (!container) return;
  container.innerHTML = "";
  const list = rows && rows.length ? rows : [{}];
  list.forEach((row) => container.append(createEntryCard(section, row)));
}

function collectEntrySection(section) {
  let container = null;
  if (section === "experience") container = ids.experienceEntries;
  else if (section === "internships") container = ids.internshipEntries;
  else if (section === "projects") container = ids.projectEntries;
  else if (section === "academic") container = ids.academicEntries;
  if (!container) return [];

  return [...container.querySelectorAll(`.entry-card[data-section="${section}"]`)].map((card) => {
    const inputs = [...card.querySelectorAll(".entry-input")];
    const points = [...card.querySelectorAll(".point-input")].map((input) => input.value.trim()).filter(Boolean);

    if (section === "academic") {
      const [yearInput, degreeInput, instInput, marksInput] = inputs;
      return {
        year: yearInput?.value.trim() || "",
        degree: degreeInput?.value.trim() || "",
        institute: instInput?.value.trim() || "",
        marks: marksInput?.value.trim() || "",
      };
    }

    if (section === "experience" || section === "internships") {
      const [titleInput, roleInput, durationInput] = inputs;
      return {
        title: titleInput?.value.trim() || "",
        role: roleInput?.value.trim() || "",
        duration: durationInput?.value.trim() || "",
        points,
      };
    }

    const [titleInput, subtitleInput, durationInput, urlInput] = inputs;
    return {
      title: titleInput?.value.trim() || "",
      subtitle: subtitleInput?.value.trim() || "",
      duration: durationInput?.value.trim() || "",
      url: urlInput?.value.trim() || "",
      points,
    };
  });
}

function loadDefaults() {
  ids.name.value = defaults.name || "";
  ids.course.value = defaults.course || "";
  ids.branch.value = defaults.branch || "";
  ids.phone.value = defaults.phone || "";
  ids.email.value = defaults.email || "";
  ids.linkedin.value = defaults.linkedin || "";
  ids.github.value = defaults.github || "";

  ids.showPhone.checked = defaults.show_contact?.phone ?? true;
  ids.showEmail.checked = defaults.show_contact?.email ?? true;
  ids.showLinkedin.checked = defaults.show_contact?.linkedin ?? true;
  ids.showGithub.checked = defaults.show_contact?.github ?? true;

  ids.showAcademic.checked = defaults.show_sections?.academic ?? true;
  ids.showExperience.checked = defaults.show_sections?.experience ?? true;
  ids.showInternships.checked = defaults.show_sections?.internships ?? true;
  ids.showProjects.checked = defaults.show_sections?.projects ?? true;
  ids.showSkills.checked = defaults.show_sections?.skills ?? true;

  renderEntrySection("academic", defaults.academic_details || []);
  renderEntrySection("experience", defaults.experience || []);
  renderEntrySection("internships", defaults.internships || []);
  renderEntrySection("projects", defaults.projects || []);

  ids.skillsLanguages.value = defaults.skills?.languages || "";
  ids.skillsLibraries.value = defaults.skills?.libraries || "";
  ids.skillsTools.value = defaults.skills?.tools || "";
}

function buildPayload() {
  return {
    name: ids.name.value.trim(),
    course: ids.course.value.trim(),
    branch: ids.branch.value.trim(),
    phone: ids.phone.value.trim(),
    email: ids.email.value.trim(),
    linkedin: ids.linkedin.value.trim(),
    github: ids.github.value.trim(),
    show_contact: {
      phone: ids.showPhone.checked,
      email: ids.showEmail.checked,
      linkedin: ids.showLinkedin.checked,
      github: ids.showGithub.checked,
    },
    academic_details: collectEntrySection("academic"),
    experience: collectEntrySection("experience"),
    internships: collectEntrySection("internships"),
    projects: collectEntrySection("projects"),
    skills: {
      languages: ids.skillsLanguages.value.trim(),
      libraries: ids.skillsLibraries.value.trim(),
      tools: ids.skillsTools.value.trim(),
    },
    show_sections: {
      academic: ids.showAcademic.checked,
      experience: ids.showExperience.checked,
      internships: ids.showInternships.checked,
      projects: ids.showProjects.checked,
      skills: ids.showSkills.checked,
    },
  };
}

let debounceHandle;
async function renderResume() {
  ids.status.textContent = "Rendering...";
  ids.error.textContent = "";

  const response = await fetch("/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildPayload()),
  });

  const body = await response.json();
  if (!response.ok || !body.ok) {
    ids.status.textContent = "Render failed";
    ids.error.textContent = body.log || body.error || "Unknown error";
    return;
  }

  ids.status.textContent = "Preview updated";
  ids.frame.src = `${body.pdf_url}#toolbar=0&navpanes=0&scrollbar=1`;
  ids.download.href = body.download_url;
}

function scheduleRender() {
  clearTimeout(debounceHandle);
  debounceHandle = setTimeout(() => {
    renderResume().catch((err) => {
      ids.status.textContent = "Render failed";
      ids.error.textContent = err.message;
    });
  }, 700);
}

function wireEvents() {
  ids.form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderResume().catch((err) => {
      ids.status.textContent = "Render failed";
      ids.error.textContent = err.message;
    });
  });

  document.querySelectorAll("[data-add-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.addEntry;
      let container = null;
      if (section === "experience") container = ids.experienceEntries;
      else if (section === "internships") container = ids.internshipEntries;
      else if (section === "projects") container = ids.projectEntries;
      else if (section === "academic") container = ids.academicEntries;
      if (!container) return;
      container.append(createEntryCard(section, {}));
      scheduleRender();
    });
  });

  if (ids.renderTop) {
    ids.renderTop.addEventListener("click", (e) => {
      e.preventDefault();
      renderResume().catch((err) => {
        ids.status.textContent = "Render failed";
        ids.error.textContent = err.message;
      });
    });
  }

  ids.form.addEventListener("input", scheduleRender);
  ids.form.addEventListener("change", scheduleRender);
}

document.addEventListener("DOMContentLoaded", () => {
  initIds();
  wireEvents();
  loadDefaults();
  scheduleRender();
});
