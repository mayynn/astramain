/**
 * Public frontpage routes
 * GET /api/frontpage          — all site_content sections
 * GET /api/landing-plans      — active plans (auto-synced from plans_coin + plans_real)
 */
import { Router } from "express"
import { query, getOne } from "../config/db.js"

const router = Router()

// ─── GET /api/frontpage ──────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const rows = await query("SELECT section_name, content_json, updated_at FROM site_content")

    const content = {}
    for (const row of rows) {
      try {
        content[row.section_name] = {
          data: JSON.parse(row.content_json),
          updatedAt: row.updated_at
        }
      } catch {
        content[row.section_name] = { data: {}, updatedAt: row.updated_at }
      }
    }

    res.json(content)
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/landing-plans ──────────────────────────────────────────────────
// Auto-synced: merges plans_coin + plans_real into a unified landing format.
// No separate landing_plans table needed.
router.get("/landing-plans", async (req, res, next) => {
  try {
    const coinPlans = await query("SELECT * FROM plans_coin ORDER BY coin_price ASC")
    const realPlans = await query("SELECT * FROM plans_real ORDER BY price ASC")

    const merged = []

    for (const p of coinPlans) {
      merged.push({
        id: `coin-${p.id}`,
        name: p.name,
        plan_type: "coin",
        price: p.initial_price ?? p.coin_price,
        renewal_price: p.renewal_price ?? p.coin_price,
        ram: p.ram,
        cpu: p.cpu,
        storage: p.storage,
        duration_days: p.duration_days,
        duration_type: p.duration_type,
        features: buildFeatures(p),
        popular: false,
        active: true
      })
    }

    for (const p of realPlans) {
      merged.push({
        id: `real-${p.id}`,
        name: p.name,
        plan_type: "real",
        price: p.price,
        renewal_price: p.price,
        ram: p.ram,
        cpu: p.cpu,
        storage: p.storage,
        duration_days: p.duration_days,
        duration_type: p.duration_type,
        features: buildFeatures(p),
        popular: false,
        active: true
      })
    }

    res.json(merged)
  } catch (error) {
    next(error)
  }
})

function buildFeatures(plan) {
  const features = []
  features.push(`${plan.ram} GB RAM`)
  features.push(`${plan.cpu} CPU Core${plan.cpu > 1 ? "s" : ""}`)
  features.push(`${plan.storage} GB Storage`)
  if (plan.backup_count > 0) features.push(`${plan.backup_count} Backup${plan.backup_count > 1 ? "s" : ""}`)
  if (plan.extra_ports > 0) features.push(`${plan.extra_ports} Extra Port${plan.extra_ports > 1 ? "s" : ""}`)
  features.push(`${plan.duration_days} Day${plan.duration_days > 1 ? "s" : ""} Duration`)
  return features
}

export default router
