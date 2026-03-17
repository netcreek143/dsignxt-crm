import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// --- Schemas ---

const clientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  industry: String,
  contactEmail: String,
  status: { type: String, default: 'active' },
  color: String,
  initials: String,
  customFields: { type: String, default: '{}' }, // Store as JSON string to maintain compatibility with existing logic or use Mixed
  notes: String,
  assignedUsers: { type: String, default: '[]' },
}, { timestamps: true });

const integrationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  type: { type: String, required: true },
  label: String,
  webhookKey: { type: String, unique: true },
  webhookUrl: String,
  platform: String,
  status: { type: String, default: 'connected' },
  leadsTotal: { type: Number, default: 0 },
  lastSync: { type: Date, default: Date.now },
}, { timestamps: true });

const leadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  integrationId: String,
  fullName: String,
  email: String,
  phone: String,
  sourceType: String,
  sourceLabel: String,
  statusId: { type: String, default: 's1' },
  temperature: { type: String, default: 'warm' },
  utm_source: String,
  utm_medium: String,
  utm_campaign: String,
  utm_term: String,
  utm_content: String,
  customData: { type: String, default: '{}' },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, default: 'active' },
  initials: String,
  color: String,
  clientId: String,
  permissions: { type: String, default: '[]' },
}, { timestamps: true });

export const Client = mongoose.model('Client', clientSchema);
export const Integration = mongoose.model('Integration', integrationSchema);
export const Lead = mongoose.model('Lead', leadSchema);
export const User = mongoose.model('User', userSchema);

export const initMongoSeeds = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    const pass = 'dsignxt123';
    const perms = JSON.stringify(['dashboard', 'clients', 'leads', 'pipeline', 'integrations', 'analytics', 'team', 'settings']);
    const users = [
      { id: 'u1', name: 'Suriya', email: 'suriya@dsignxt.com', password: pass, role: 'super_admin', initials: 'S', color: '#6366f1', clientId: null, permissions: perms },
      { id: 'u2', name: 'Prasanth', email: 'prasanth@dsignxt.com', password: pass, role: 'admin', initials: 'P', color: '#8b5cf6', clientId: null, permissions: perms },
      { id: 'u3', name: 'Viknesh', email: 'viknesh@dsignxt.com', password: pass, role: 'manager', initials: 'V', color: '#ec4899', clientId: null, permissions: perms },
      { id: 'u4', name: 'Charan', email: 'charan@dsignxt.com', password: pass, role: 'executive', initials: 'C', color: '#f59e0b', clientId: null, permissions: perms },
      { id: 'u5', name: 'Nivetha', email: 'nivetha@dsignxt.com', password: pass, role: 'executive', initials: 'N', color: '#10b981', clientId: null, permissions: perms },
      { id: 'u6', name: 'Client User', email: 'client@vireka.in', password: pass, role: 'client', initials: 'C', color: '#059669', clientId: 'c1', permissions: '[]' },
    ];
    await User.insertMany(users);
    console.log('✅ Base users seeded to MongoDB.');
  }
};
