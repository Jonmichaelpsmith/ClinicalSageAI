export interface RegionRule {
  m1Folders: string[];
  requiredForms: { id: string; title: string; module: string }[];
}

export const REGION_RULES: Record<"FDA" | "EMA" | "PMDA", RegionRule> = {
  FDA: {
    m1Folders: [
      "m1/cover",
      "m1/1-forms",
      "m1/3-investigator-brochure"
    ],
    requiredForms: [
      { id: "1571", title: "FDA Form 1571", module: "m1/1-forms" },
      { id: "1572", title: "FDA Form 1572", module: "m1/1-forms" },
      { id: "3674", title: "FDA Form 3674", module: "m1/1-forms" }
    ]
  },
  EMA: {
    m1Folders: [
      "m1/eu-cover",
      "m1/eu-application",
      "m1/eu-annex"
    ],
    requiredForms: [
      { id: "EUAF", title: "EU Application Form", module: "m1/eu-application" }
    ]
  },
  PMDA: {
    m1Folders: [
      "m1/jp-cover",
      "m1/jp-forms",
      "m1/jp-annex"
    ],
    requiredForms: [
      { id: "JPCTAF", title: "JP Clinical Trial Application Form", module: "m1/jp-forms" }
    ]
  }
};