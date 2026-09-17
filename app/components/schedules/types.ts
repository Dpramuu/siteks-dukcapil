// ── Platform ──

export type Platform = "Instagram" | "TikTok" | "Twitter";

export type FilterType = "all" | Platform;

// ── Schedule Platform ──

export type SchedulePlatform = {
  id: string;
  schedule_id: string;
  platform: Platform;
  is_uploaded: boolean;
  uploaded_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

// ── Schedule ──

export type ScheduleStatus = "draft" | "scheduled" | "published";

export type Schedule = {
  id: string;
  user_id: string;
  template_id: string | null;

  title: string;
  caption: string;

  status: ScheduleStatus;

  /*
   * MySQL DATETIME dapat diterima sebagai Date
   * atau string tergantung proses query/serialisasi.
   */
  scheduled_for: string | Date | null;

  created_at: string | Date;
  updated_at: string | Date;

  // Relasi — diisi saat fetch
  schedule_platforms?: SchedulePlatform[];
};

// ── Schedule Insert ──

export type ScheduleInsert = {
  template_id?: string | null;

  title: string;
  caption: string;

  status: ScheduleStatus;

  /*
   * Data dari form dikirim sebagai string.
   */
  scheduled_for: string;
};

// ── Template ──

export type Template = {
  id: string;
  user_id: string;

  name: string;
  platform: Platform;
  content: string;

  created_at: string | Date;
  updated_at: string | Date;
};

export type TemplateInsert = {
  name: string;
  platform: Platform;
  content: string;
};

export type TemplateUpdate = Partial<TemplateInsert>;

// ── UI Helpers ──

export const PLATFORM_STYLE: Record<
  Platform,
  {
    color: string;
    bg: string;
    tc: string;
  }
> = {
  Instagram: {
    color: "#185FA5",
    bg: "#E6F1FB",
    tc: "#185FA5",
  },

  TikTok: {
    color: "#D4537E",
    bg: "#FBEAF0",
    tc: "#993556",
  },

  Twitter: {
    color: "#1D9E75",
    bg: "#E1F5EE",
    tc: "#0F6E56",
  },
};

export const STATUS_STYLE: Record<
  ScheduleStatus,
  {
    bg: string;
    tc: string;
    label: string;
  }
> = {
  draft: {
    bg: "#27272a",
    tc: "#a1a1aa",
    label: "Draft",
  },

  scheduled: {
    bg: "#1e3a5f",
    tc: "#60a5fa",
    label: "Scheduled",
  },

  published: {
    bg: "#14532d",
    tc: "#4ade80",
    label: "Published",
  },
};

// ── Platform List ──

export const PLATFORMS: Platform[] = ["Instagram", "TikTok", "Twitter"];

// ── Month Names ──

export const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// ── Day Names ──

export const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
