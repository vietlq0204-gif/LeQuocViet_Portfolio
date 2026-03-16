const i18nStore = window.PORTFOLIO_I18N;
const projectStore = window.PORTFOLIO_PROJECT_DATA;
const languageStorageKey = "portfolio-language";
const defaultCatalogSection = "game";

const getNestedValue = (source, key) => {
  return key.split(".").reduce((result, segment) => result?.[segment], source);
};

const getSupportedLanguage = (language) => {
  const supportedLanguages = i18nStore?.supportedLanguages || [];

  return supportedLanguages.includes(language) ? language : i18nStore?.defaultLanguage || "en";
};

const getTranslation = (key, language) => {
  const resolvedLanguage = getSupportedLanguage(language);
  const currentTranslations = i18nStore?.translations?.[resolvedLanguage];
  const fallbackTranslations = i18nStore?.translations?.[i18nStore?.defaultLanguage || "en"];

  return getNestedValue(currentTranslations, key) ?? getNestedValue(fallbackTranslations, key) ?? "";
};

const localizeValue = (value, language) => {
  if (value == null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "object") {
    const resolvedLanguage = getSupportedLanguage(language);

    if (resolvedLanguage in value || "en" in value || "vi" in value) {
      return value[resolvedLanguage] ?? value.en ?? value.vi ?? "";
    }
  }

  return value;
};

const getProjectEntries = () => Object.entries(projectStore?.items || {});
const getProjectById = (projectId) => projectStore?.items?.[projectId] || null;
const getProjectCatalogSection = (project) => project?.catalog?.section || defaultCatalogSection;
const getProjectFallbackImage = (project) => project?.cover || project?.images?.[0] || "";

const fillList = (listElement, items) => {
  if (!listElement) {
    return;
  }

  listElement.replaceChildren();

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    listElement.appendChild(listItem);
  });
};

const fillTranslatedList = (listElement, key, language) => {
  const items = getTranslation(key, language);

  if (!listElement) {
    return;
  }

  listElement.replaceChildren();

  if (!Array.isArray(items)) {
    return;
  }

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    listElement.appendChild(listItem);
  });
};

let currentLanguage = getSupportedLanguage(localStorage.getItem(languageStorageKey) || i18nStore?.defaultLanguage);
const languageToggleButton = document.getElementById("language-toggle");
const catalogGridEl = document.querySelector("[data-project-catalog-grid]");
const catalogEmptyEl = document.querySelector("[data-project-catalog-empty]");
const catalogFilterButtons = Array.from(document.querySelectorAll("[data-project-filter]"));
const utilityBarMediaQuery = window.matchMedia("(max-width: 768px)");

let activeCatalogSection =
  catalogFilterButtons[0]?.dataset.projectFilter ||
  defaultCatalogSection;
let lastScrollY = window.scrollY;
let utilityBarTicking = false;

const setUtilityBarHidden = (shouldHide) => {
  document.body.classList.toggle("utility-bar-hidden", shouldHide && utilityBarMediaQuery.matches);
};

const updateUtilityBarVisibility = () => {
  utilityBarTicking = false;

  if (!utilityBarMediaQuery.matches || document.body.classList.contains("body-lock")) {
    setUtilityBarHidden(false);
    lastScrollY = window.scrollY;
    return;
  }

  const currentScrollY = window.scrollY;
  const delta = currentScrollY - lastScrollY;

  if (Math.abs(delta) < 8) {
    return;
  }

  setUtilityBarHidden(delta > 0 && currentScrollY > 24);
  lastScrollY = currentScrollY;
};

const handleUtilityBarScroll = () => {
  if (utilityBarTicking) {
    return;
  }

  utilityBarTicking = true;
  window.requestAnimationFrame(updateUtilityBarVisibility);
};

const syncUtilityBarViewport = () => {
  setUtilityBarHidden(false);
  lastScrollY = window.scrollY;
};

const applyStaticTranslations = (language) => {
  document.documentElement.lang = language;
  document.title = getTranslation("meta.title", language);

  const metaDescription = document.querySelector('meta[name="description"]');

  if (metaDescription) {
    metaDescription.setAttribute("content", getTranslation("meta.description", language));
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getTranslation(element.dataset.i18n, language);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const mappings = element.dataset.i18nAttr.split(";").map((item) => item.trim()).filter(Boolean);

    mappings.forEach((mapping) => {
      const [attribute, key] = mapping.split(":").map((item) => item.trim());

      if (attribute && key) {
        element.setAttribute(attribute, getTranslation(key, language));
      }
    });
  });

  document.querySelectorAll("[data-i18n-list]").forEach((element) => {
    fillTranslatedList(element, element.dataset.i18nList, language);
  });

  if (languageToggleButton) {
    languageToggleButton.textContent = language.toUpperCase();
    languageToggleButton.setAttribute("aria-pressed", "true");
  }
};

const renderFeaturedProject = (language) => {
  const featuredElement = document.querySelector(".featured-project[data-project-id]");

  if (!featuredElement) {
    return;
  }

  const project = getProjectById(featuredElement.dataset.projectId);

  if (!project) {
    return;
  }

  const videoEl = featuredElement.querySelector(".Preview-video");
  const titleEl = featuredElement.querySelector("#featured-project-title");
  const summaryEl = featuredElement.querySelector(".featured-project-summary");
  const roleEl = featuredElement.querySelector(".featured-project-role");
  const techEl = featuredElement.querySelector(".featured-project-tech");
  const title = localizeValue(project.title, language);

  if (videoEl) {
    videoEl.src = project.video || "about:blank";
    videoEl.title = `${title} ${getTranslation("popup.videoTitleSuffix", language)}`;
  }

  if (titleEl) {
    titleEl.textContent = title;
  }

  if (summaryEl) {
    summaryEl.textContent = localizeValue(project.summary, language) || localizeValue(project.overview, language) || "";
  }

  fillList(roleEl, localizeValue(project.roles, language) || []);
  fillList(techEl, localizeValue(project.technologies, language) || []);
};

const renderProjectCards = (language) => {
  const cards = document.querySelectorAll(".project-card[data-project-id]");

  cards.forEach((card) => {
    const project = getProjectById(card.dataset.projectId);

    if (!project) {
      return;
    }

    const imageEl = card.querySelector(".project-cover");
    const titleEl = card.querySelector(".project-name");
    const descriptionEl = card.querySelector(".project-description");
    const title = localizeValue(project.title, language);
    const cover = getProjectFallbackImage(project);

    if (imageEl) {
      imageEl.src = cover;
      imageEl.alt = `${title} ${getTranslation("popup.keyArtSuffix", language)}`;
    }

    if (titleEl) {
      titleEl.textContent = title;
    }

    if (descriptionEl) {
      descriptionEl.textContent = localizeValue(project.summary, language) || localizeValue(project.overview, language) || "";
    }
  });
};

const createCatalogMediaElement = (project, title, language) => {
  const cover = getProjectFallbackImage(project);

  if (!cover) {
    const placeholder = document.createElement("div");
    placeholder.className = "catalog-card-media-placeholder";
    placeholder.textContent = title;
    return placeholder;
  }

  const image = document.createElement("img");
  image.className = "catalog-card-image";
  image.src = cover;
  image.alt = `${title} ${getTranslation("popup.keyArtSuffix", language)}`;
  image.loading = "lazy";
  return image;
};

const renderProjectCatalog = (language, section = activeCatalogSection) => {
  if (!catalogGridEl) {
    return;
  }

  activeCatalogSection = section || defaultCatalogSection;
  catalogGridEl.replaceChildren();

  const projects = getProjectEntries().filter(([, project]) => getProjectCatalogSection(project) === activeCatalogSection);

  projects.forEach(([projectId, project]) => {
    const title = localizeValue(project.title, language) || "Project";
    const summary = localizeValue(project.summary, language) || localizeValue(project.overview, language) || "";
    const card = document.createElement("article");
    const media = document.createElement("div");
    const content = document.createElement("div");
    const titleEl = document.createElement("h3");
    const summaryEl = document.createElement("p");
    const actionButton = document.createElement("button");

    card.className = "catalog-card";
    card.dataset.projectEntry = "";
    card.dataset.projectId = projectId;

    media.className = "catalog-card-media";
    media.appendChild(createCatalogMediaElement(project, title, language));

    content.className = "catalog-card-content";
    titleEl.className = "catalog-card-title";
    titleEl.textContent = title;
    summaryEl.className = "catalog-card-summary";
    summaryEl.textContent = summary;

    actionButton.className = "btn-project-detail js-open-project-popup";
    actionButton.type = "button";
    actionButton.setAttribute("aria-controls", "project-popup");
    actionButton.textContent = getTranslation("buttons.viewDetails", language);

    content.append(titleEl, summaryEl, actionButton);
    card.append(media, content);
    catalogGridEl.appendChild(card);
  });

  if (catalogEmptyEl) {
    catalogEmptyEl.hidden = projects.length > 0;
  }

  catalogFilterButtons.forEach((button) => {
    const isActive = button.dataset.projectFilter === activeCatalogSection;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const popup = document.getElementById("project-popup");
const dialog = popup?.querySelector(".popup-box");
const closeBtn = popup?.querySelector(".btn-close");
const popupTitleEl = popup?.querySelector(".popup-title");
const popupDescEl = popup?.querySelector(".popup-desc");
const popupSummaryEl = popup?.querySelector(".popup-summary");
const popupTechEl = popup?.querySelector(".popup-tech");
const popupRoleEl = popup?.querySelector(".popup-role");
const popupVideoWrapperEl = popup?.querySelector(".popup-video-wrapper");
const popupVideoEl = popup?.querySelector(".popup-video");
const popupStageImageEl = popup?.querySelector(".popup-stage-image");
const popupThumbnailsEl = popup?.querySelector(".popup-thumbnails");
const popupCoverEl = popup?.querySelector(".popup-cover");
const popupGithubBtn = popup?.querySelector(".btn-github");
const popupTagsEl = popup?.querySelector(".popup-tags");
const popupTagsBlockEl = popup?.querySelector(".popup-tags-block");
const popupMetaFields = popup
  ? {
      review: popup.querySelector(".popup-review"),
      release: popup.querySelector(".popup-release"),
      developer: popup.querySelector(".popup-developer"),
      publisher: popup.querySelector(".popup-publisher"),
    }
  : {};

let activeTrigger = null;
let activeProjectId = null;

const fillPopupTags = (items) => {
  if (!popupTagsEl) {
    return;
  }

  popupTagsEl.replaceChildren();

  items.forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "popup-tag";
    tag.textContent = item;
    popupTagsEl.appendChild(tag);
  });
};

const fillPopupMeta = (project, language) => {
  if (!popup) {
    return;
  }

  Object.entries(popupMetaFields).forEach(([key, element]) => {
    const row = popup.querySelector(`[data-meta-row="${key}"]`);
    const value = localizeValue(project[key], language);

    if (!row || !element) {
      return;
    }

    element.textContent = value || "";
    row.hidden = !value;
  });
};

const setMediaView = (item, title, thumbnailButtons, language) => {
  if (!popupVideoWrapperEl || !popupVideoEl || !popupStageImageEl) {
    return;
  }

  thumbnailButtons.forEach((button) => {
    const isActive = button.dataset.mediaId === item.id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (item.type === "video") {
    popupVideoWrapperEl.hidden = false;
    popupVideoEl.src = item.src;
    popupVideoEl.title = `${title} ${getTranslation("popup.videoTitleSuffix", language)}`;
    popupStageImageEl.hidden = true;
    return;
  }

  popupVideoWrapperEl.hidden = true;
  popupVideoEl.src = "about:blank";
  popupStageImageEl.hidden = false;
  popupStageImageEl.src = item.src;
  popupStageImageEl.alt = `${title} ${getTranslation("popup.screenshot", language)} ${item.index}`;
};

const fillPopupMedia = (project, language) => {
  if (!popupThumbnailsEl || !popupVideoWrapperEl || !popupVideoEl || !popupStageImageEl) {
    return;
  }

  popupThumbnailsEl.replaceChildren();

  const mediaItems = [];
  const title = localizeValue(project.title, language);
  const images = project.images || [];
  const cover = project.cover || images[0] || "";

  if (project.video) {
    mediaItems.push({
      id: "video",
      type: "video",
      src: project.video,
      thumb: cover || images[0] || "",
      label: getTranslation("popup.trailer", language),
    });
  }

  images.forEach((src, index) => {
    mediaItems.push({
      id: `image-${index + 1}`,
      type: "image",
      src,
      thumb: src,
      label: `${getTranslation("popup.screenshot", language)} ${index + 1}`,
      index: index + 1,
    });
  });

  const thumbnailButtons = mediaItems.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "popup-thumbnail";
    button.dataset.mediaId = item.id;
    button.setAttribute("aria-label", `${title} ${item.label}`);
    button.setAttribute("aria-pressed", "false");

    if (item.thumb) {
      const image = document.createElement("img");
      image.src = item.thumb;
      image.alt = "";
      image.loading = "lazy";
      button.appendChild(image);
    }

    const label = document.createElement("span");
    label.className = "popup-thumbnail-label";
    label.textContent = item.label;
    button.appendChild(label);

    if (item.type === "video") {
      const badge = document.createElement("span");
      badge.className = "popup-thumbnail-badge";
      badge.textContent = getTranslation("popup.play", language);
      button.appendChild(badge);
    }

    button.addEventListener("click", () => {
      setMediaView(item, title, thumbnailButtons, language);
    });

    popupThumbnailsEl.appendChild(button);
    return button;
  });

  if (mediaItems.length === 0) {
    popupVideoWrapperEl.hidden = true;
    popupVideoEl.src = "about:blank";
    popupStageImageEl.hidden = true;
    return;
  }

  setMediaView(mediaItems[0], title, thumbnailButtons, language);
};

const renderPopupProject = (projectId, language) => {
  const project = getProjectById(projectId);

  if (!popup || !project) {
    return;
  }

  const title = localizeValue(project.title, language) || "Project";
  const overview = localizeValue(project.overview, language) || "";
  const summary = localizeValue(project.summary, language) || overview;

  activeProjectId = projectId;

  if (popupTitleEl) {
    popupTitleEl.textContent = title;
  }

  if (popupDescEl) {
    popupDescEl.textContent = overview;
  }

  if (popupSummaryEl) {
    popupSummaryEl.textContent = summary;
  }

  fillList(popupTechEl, localizeValue(project.technologies, language) || []);
  fillList(popupRoleEl, localizeValue(project.roles, language) || []);
  fillPopupTags(localizeValue(project.tags, language) || []);

  if (popupTagsBlockEl) {
    popupTagsBlockEl.hidden = (localizeValue(project.tags, language) || []).length === 0;
  }

  fillPopupMeta(project, language);
  fillPopupMedia(project, language);

  if (popupCoverEl) {
    if (project.cover) {
      popupCoverEl.hidden = false;
      popupCoverEl.src = project.cover;
      popupCoverEl.alt = `${title} ${getTranslation("popup.keyArtSuffix", language)}`;
    } else {
      popupCoverEl.hidden = true;
      popupCoverEl.removeAttribute("src");
      popupCoverEl.removeAttribute("alt");
    }
  }

  if (popupGithubBtn) {
    if (project.github) {
      popupGithubBtn.href = project.github;
      popupGithubBtn.hidden = false;
    } else {
      popupGithubBtn.hidden = true;
      popupGithubBtn.removeAttribute("href");
    }
  }
};

const openPopup = (projectId, trigger) => {
  if (!popup || !dialog || !closeBtn) {
    return;
  }

  activeTrigger = trigger;
  renderPopupProject(projectId, currentLanguage);

  popup.hidden = false;
  dialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("body-lock");
  closeBtn.focus();
};

const closePopup = () => {
  if (!popup || !dialog || !popupVideoEl || !popupThumbnailsEl || !popupTagsEl || !popupStageImageEl) {
    return;
  }

  popup.hidden = true;
  dialog.setAttribute("aria-hidden", "true");
  popupVideoEl.src = "about:blank";
  popupThumbnailsEl.replaceChildren();
  popupTagsEl.replaceChildren();

  if (popupTagsBlockEl) {
    popupTagsBlockEl.hidden = false;
  }

  popupStageImageEl.hidden = true;
  document.body.classList.remove("body-lock");

  if (activeTrigger?.isConnected) {
    activeTrigger.focus();
  }

  activeTrigger = null;
};

const releasePreviewPlayers = () => {
  const featuredVideoEl = document.querySelector(".Preview-video");

  if (featuredVideoEl) {
    featuredVideoEl.src = "about:blank";
  }

  if (popupVideoEl) {
    popupVideoEl.src = "about:blank";
  }
};

const renderLanguage = (language) => {
  currentLanguage = getSupportedLanguage(language);
  localStorage.setItem(languageStorageKey, currentLanguage);

  applyStaticTranslations(currentLanguage);
  renderFeaturedProject(currentLanguage);
  renderProjectCards(currentLanguage);
  renderProjectCatalog(currentLanguage, activeCatalogSection);

  if (activeProjectId && popup && !popup.hidden) {
    renderPopupProject(activeProjectId, currentLanguage);
  }
};

if (i18nStore && projectStore) {
  renderLanguage(currentLanguage);

  languageToggleButton?.addEventListener("click", () => {
    const nextLanguage = currentLanguage === "en" ? "vi" : "en";
    renderLanguage(nextLanguage);
  });

  catalogFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      renderProjectCatalog(currentLanguage, button.dataset.projectFilter);
    });
  });

  syncUtilityBarViewport();
  window.addEventListener("scroll", handleUtilityBarScroll, { passive: true });
  window.addEventListener("resize", syncUtilityBarViewport);

  if (typeof utilityBarMediaQuery.addEventListener === "function") {
    utilityBarMediaQuery.addEventListener("change", syncUtilityBarViewport);
  } else {
    utilityBarMediaQuery.addListener(syncUtilityBarViewport);
  }
}

if (popup && projectStore) {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".js-open-project-popup");

    if (!button) {
      return;
    }

    const entry = button.closest("[data-project-entry]");

    if (!entry) {
      return;
    }

    openPopup(entry.dataset.projectId, button);
  });

  closeBtn?.addEventListener("click", closePopup);

  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      closePopup();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !popup.hidden) {
      closePopup();
    }
  });

  window.addEventListener("pagehide", releasePreviewPlayers);
  window.addEventListener("pageshow", () => {
    renderFeaturedProject(currentLanguage);
  });
}
