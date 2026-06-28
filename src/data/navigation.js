export const NAV_TREE = [
  {
    title: "Squad",
    children: [
      { title: "Hero Guide", path: "/guides/squad/basic-setup" },
      {
        title: "Skills",
        children: [
          { title: "Tank Heroes", path: "/guides/squad/skills/tank-heroes" },
          { title: "Air Heroes",  path: "/guides/squad/skills/air-heroes"  }
        ]
      },
      {
        title: "Equipment",
        children: [
          { title: "Leveling Guide", path: "/guides/squad/equipment/leveling-guide" },
          { title: "Resource Cost",  path: "/guides/squad/equipment/resource-cost"  }
        ]
      }
    ]
  },
  {
    title: "Buildings",
    children: [
      {
        title: "HQ",
        children: [
          { title: "1-30",  path: "/guides/buildings/hq/1-30"  },
          { title: "25-35", path: "/guides/buildings/hq/25-30" }
        ]
      }
    ]
  },
  { title: "Store", path: "/guides/store" },
  {
    title: "Events",
    children: [
      { title: "Wanted Boss",  path: "/guides/events/wanted-boss"  },
      { title: "Desert Storm", path: "/guides/events/desert-storm" }
    ]
  },
  {
    title: "Season",
    children: [
      { title: "Season 1", path: "/guides/seasons/1" },
      { title: "Season 2", path: "/guides/seasons/2" },
      { title: "Season 3", path: "/guides/seasons/3" },
      { title: "Season 4", path: "/guides/seasons/4" },
      { title: "Season 5", path: "/guides/seasons/5" },
      { title: "Season 6", path: "/guides/seasons/6" }
    ]
  },
  {
    title: "About",
    children: [
      { title: "This App", path: "/about/app"   },
      { title: "Satch",    path: "/about/satch" }
    ]
  },
  { title: "Shoutouts", path: "/shoutouts" },
  { title: "Official Site", href: "https://www.lastwar.com/", external: true, menuOnly: true }
];
