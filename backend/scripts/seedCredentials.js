/**
 * Creates or resets default Super Admin and demo User for local/dev.
 * Run from backend folder: npm run seed
 *
 * Override via env (optional):
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_URL_SLUG
 *   SEED_USER_EMAIL, SEED_USER_PASSWORD
 *   SEED_ADMIN_AS_CLIENT_USER=0 — skip creating a User with the same email/password as admin
 */
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import Admin from '../models/Admin.js'
import User from '../models/User.js'
import AdminWallet from '../models/AdminWallet.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || 'bull4x@support.com').toLowerCase()
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'BULL4XAdmin@123'
const ADMIN_URL_SLUG = (process.env.SEED_ADMIN_URL_SLUG || 'bull4x-main').toLowerCase()

const USER_EMAIL = (process.env.SEED_USER_EMAIL || 'demo@bull4x.com').toLowerCase()
const USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'User@123456'

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in backend/.env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB\n')

  // --- Super Admin (password login: POST /api/admin-mgmt/login) ---
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  let admin = await Admin.findOne({ email: ADMIN_EMAIL })

  if (admin) {
    admin.password = adminHash
    admin.role = 'SUPER_ADMIN'
    admin.status = 'ACTIVE'
    admin.firstName = admin.firstName || 'BULL4X'
    admin.lastName = admin.lastName || 'Admin'
    admin.brandName = admin.brandName || 'BULL4X'
    const slugOwner = await Admin.findOne({ urlSlug: ADMIN_URL_SLUG, _id: { $ne: admin._id } })
    if (!slugOwner) {
      admin.urlSlug = ADMIN_URL_SLUG
    }
    await admin.save()
    console.log('Super Admin: updated existing record')
  } else {
    let urlSlug = ADMIN_URL_SLUG
    if (await Admin.findOne({ urlSlug })) {
      urlSlug = `${ADMIN_URL_SLUG}-${Date.now()}`
      console.warn(`URL slug taken; using: ${urlSlug}`)
    }
    admin = await Admin.create({
      email: ADMIN_EMAIL,
      password: adminHash,
      firstName: 'BULL4X',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      urlSlug,
      brandName: 'BULL4X',
      status: 'ACTIVE',
      sidebarPermissions: {}
    })
    console.log('Super Admin: created')
  }

  let aw = await AdminWallet.findOne({ adminId: admin._id })
  if (!aw) {
    await AdminWallet.create({ adminId: admin._id, balance: 999999999 })
    console.log('Super Admin wallet: created')
  }

  console.log('\n--- Admin login (/admin, Super Admin) ---')
  console.log('Email:   ', ADMIN_EMAIL)
  console.log('Password:', ADMIN_PASSWORD)
  console.log('URL slug:', admin.urlSlug)

  // --- Same email/password on /user/login (User collection ≠ Admin collection) ---
  const mirrorAdminAsUser = process.env.SEED_ADMIN_AS_CLIENT_USER !== '0'
  if (mirrorAdminAsUser) {
    let clientTwin = await User.findOne({ email: ADMIN_EMAIL })
    if (clientTwin) {
      clientTwin.password = ADMIN_PASSWORD
      clientTwin.isBlocked = false
      clientTwin.isBanned = false
      clientTwin.firstName = clientTwin.firstName || 'BULL4X'
      clientTwin.address = clientTwin.address || 'Dev account (matches admin email)'
      await clientTwin.save()
      console.log('\nClient user (same as admin email): updated')
    } else {
      await User.create({
        firstName: 'BULL4X',
        email: ADMIN_EMAIL,
        phone: '9999999999',
        countryCode: '+91',
        address: 'Dev account — same login as Super Admin for /user/login',
        password: ADMIN_PASSWORD
      })
      console.log('\nClient user (same as admin email): created')
    }
    console.log('--- Also works on /user/login ---')
    console.log('Email:   ', ADMIN_EMAIL)
    console.log('Password:', ADMIN_PASSWORD)
  }

  // --- Demo client (POST /api/auth/login) ---
  let user = await User.findOne({ email: USER_EMAIL })
  if (user) {
    user.password = USER_PASSWORD
    user.isBlocked = false
    user.isBanned = false
    user.firstName = user.firstName || 'Demo'
    user.address = user.address || 'Demo address (dev)'
    await user.save()
    console.log('\nDemo user: password reset / unblocked')
  } else {
    user = await User.create({
      firstName: 'Demo',
      email: USER_EMAIL,
      phone: '9999999999',
      countryCode: '+91',
      address: 'Demo address for local development',
      password: USER_PASSWORD
    })
    console.log('\nDemo user: created')
  }

  console.log('\n--- User login (/user/login) ---')
  console.log('Email:   ', USER_EMAIL)
  console.log('Password:', USER_PASSWORD)

  console.log('\nDone. Change these passwords before production.\n')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
