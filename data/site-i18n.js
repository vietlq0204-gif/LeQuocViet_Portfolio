window.PORTFOLIO_I18N = (() => {
  const supportedLanguages = ["en", "vi"];

  // Keep English and Vietnamese text side by side here for easier editing.
  const copy = {
    meta: {
      title: {
        en: "Le Quoc Viet | Unity Developer",
        vi: "Le Quoc Viet | Lập Trình Viên Unity",
      },
      description: {
        en: "My main stack is Unity and C#. I built the game's core system with a focus on ease of maintenance and extensibility.",
        vi: "Stack chính của tôi là Unity và C#. Tôi xây dựng hệ thống lõi của trò chơi với trọng tâm là dễ bảo trì và mở rộng.",
      },
    },
    language: {
      switcher: {
        en: "Toggle Language",
        vi: "Đổi Ngôn Ngữ",
      },
    },
    hero: {
      label: {
        en: "Portfolio",
        vi: "Hồ Sơ",
      },
      role: {
        en: "Unity Developer",
        vi: "Lập Trình Viên Unity",
      },
      summary: {
        en: "Full stack game developer with Unity and C#.",
        vi: "Lập trình viên game full-stack với Unity và C#.",
      },
    },
    featured: {
      label: {
        en: "Featured Project",
        vi: "Dự Án Nổi Bật",
      },
    },
    sections: {
      selectedWork: {
        en: "Selected Work",
        vi: "Dự Án Tiêu Biểu",
      },
      projects: {
        en: "Projects",
        vi: "Dự Án",
      },
      about: {
        en: "About",
        vi: "Giới Thiệu",
      },
      technicalSkills: {
        en: "Technical Skills",
        vi: "Kỹ Năng Kỹ Thuật",
      },
      contact: {
        en: "Contact",
        vi: "Liên Hệ",
      },
      fullProjects: {
        en: "Full Projects",
        vi: "Toàn Bộ Dự Án",
      },
    },
    labels: {
      overview: {
        en: "Overview",
        vi: "Tổng Quan",
      },
      technology: {
        en: "Technology",
        vi: "Công Nghệ",
      },
      myRole: {
        en: "My Role",
        vi: "Vai Trò",
      },
      review: {
        en: "Review",
        vi: "Đánh Giá",
      },
      release: {
        en: "Release",
        vi: "Phát Hành",
      },
      developer: {
        en: "Developer",
        vi: "Phát Triển",
      },
      publisher: {
        en: "Publisher",
        vi: "Phát Hành",
      },
      popularTags: {
        en: "Popular Tags",
        vi: "Thẻ Phổ Biến",
      },
    },
    buttons: {
      viewCv: {
        en: "View CV",
        vi: "Xem CV",
      },
      viewDetails: {
        en: "View Details",
        vi: "Xem Chi Tiết",
      },
      seeMore: {
        en: "See More",
        vi: "Xem Thêm",
      },
      backHome: {
        en: "Back Home",
        vi: "Trang Chủ",
      },
      github: {
        en: "GitHub",
        vi: "GitHub",
      },
      download: {
        en: "Download",
        vi: "Tải Xuống",
      },
    },
    catalog: {
      game: {
        en: "Game",
        vi: "Game",
      },
      other: {
        en: "Other",
        vi: "Khác",
      },
      empty: {
        en: "No projects in this section yet.",
        vi: "Chưa có dự án nào trong mục này.",
      },
    },
    popup: {
      title: {
        en: "Project Details",
        vi: "Chi Tiết Dự Án",
      },
      galleryLabel: {
        en: "Project media gallery",
        vi: "Thư Viện Media Dự Án",
      },
      closeLabel: {
        en: "Close project details",
        vi: "Đóng Chi Tiết Dự Án",
      },
      videoTitleSuffix: {
        en: "gameplay preview",
        vi: "video gameplay",
      },
      keyArtSuffix: {
        en: "key art",
        vi: "ảnh đại diện",
      },
      screenshot: {
        en: "Shot",
        vi: "Ảnh",
      },
      trailer: {
        en: "Trailer",
        vi: "Trailer",
      },
      play: {
        en: "Play",
        vi: "Phát",
      },
    },
    about: {
      description: {
        en: "My main stack is Unity and C#. I built the game's core system with a focus on ease of maintenance and extensibility.",
        vi: "Stack chính của tôi là Unity và C#. Tôi xây dựng hệ thống lõi của trò chơi với trọng tâm là dễ bảo trì và mở rộng.",
      },
      portraitAlt: {
        en: "Portrait of Le Quoc Viet",
        vi: "Chân dung của Lê Quốc Việt",
      },
      skills: {
        en: [
          "Unity Engine, Mono, .NET Standard, and IL2CPP.",
          "C# and async/await workflows.",
          "OOP, SOLID, singleton, state machine, observer, and factory patterns.",
          "Gameplay systems, character controller, input system, AI, and save/load flows.",
          "Profiling, object pooling, and runtime optimization.",
          "Git, Unity Package Manager, and build pipeline delivery for PC and mobile.",
        ],
        vi: [
          "Unity Engine, Mono, .NET Standard và IL2CPP.",
          "C# và quy trình async/await.",
          "OOP, SOLID, singleton, state machine, observer và factory pattern.",
          "Gameplay systems, character controller, input system, AI và save/load flow.",
          "Profiling, object pooling và tối ưu runtime.",
          "Git, Unity Package Manager và build pipeline cho PC và mobile.",
        ],
      },
    },
    footer: {
      country: {
        en: "Vietnam",
        vi: "Việt Nam",
      },
      about: {
        en: "About",
        vi: "Giới Thiệu",
      },
      projects: {
        en: "Projects",
        vi: "Dự Án",
      },
      email: {
        en: "Email",
        vi: "Email",
      },
      copyright: {
        en: "Copyright 2025 (c) Le Quoc Viet",
        vi: "Bản Quyền 2025 (c) Le Quoc Viet",
      },
    },
  };

  const buildLanguageTree = (node, language) => {
    if (Array.isArray(node)) {
      return node.map((item) => buildLanguageTree(item, language));
    }

    if (!node || typeof node !== "object") {
      return node;
    }

    if (supportedLanguages.some((code) => code in node)) {
      return node[language] ?? node.en ?? node.vi ?? "";
    }

    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, buildLanguageTree(value, language)]),
    );
  };

  return {
    defaultLanguage: "en",
    supportedLanguages,
    translations: Object.fromEntries(
      supportedLanguages.map((language) => [language, buildLanguageTree(copy, language)]),
    ),
  };
})();
