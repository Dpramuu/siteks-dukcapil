import { redirect } from "next/navigation";

import { pool } from "@/lib/db";

import { getSessionUserId } from "@/lib/auth";

import TemplatePage from "@/app/components/template/TemplatePage";

import type { Template } from "@/app/components/template/types";

export default async function TemplateRoute() {
  // Ambil user dari session lokal
  const userId = await getSessionUserId();

  // Belum login → ke halaman login
  if (!userId) {
    redirect("/login");
  }

  // Ambil template milik user dari MySQL
  const [rows] = await pool.execute(
    `
    SELECT
      id,
      user_id,
      name,
      content,
      platform,
      created_at,
      updated_at
    FROM templates
    WHERE user_id = ?
    ORDER BY name ASC
    `,
    [userId],
  );

  const templates = rows as Template[];

  return <TemplatePage userId={userId} initialTemplates={templates} />;
}
