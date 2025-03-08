// =============== IMPORTS ===============
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  orderBy,
  limit 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// =============== CONFIGURATION ===============
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// =============== INITIALIZATION ===============
let app;
let db;
let auth;
let functions;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  functions = getFunctions(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// =============== ROLES MANAGEMENT SERVICE ===============
export const roleManagementService = {
  async addRole(roleData) {
    if (!roleData || !roleData.address || !roleData.role || !roleData.memberId || !roleData.action) {
      throw new Error('Invalid role data: address, role, memberId and action are required');
    }

    try {
      console.log('Adding new role to Firestore:', roleData);
      const rolesRef = collection(db, 'web3Roles');

      const newRole = {
        address: roleData.address.toLowerCase(),
        role: roleData.role,
        action: roleData.action, // Nouveau champ
        memberId: roleData.memberId,
        memberName: roleData.memberName,
        category: roleData.category,
        country: roleData.country,
        transactionHash: roleData.transactionHash || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(rolesRef, newRole);
      console.log('Role added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding role to Firestore:', error);
      throw new Error(`Failed to add role: ${error.message}`);
    }
  },

  async updateRoleStatus(roleId, newStatus, transactionHash = null) {
    if (!roleId || !newStatus) {
      throw new Error('Role ID and new status are required');
    }

    try {
      console.log('Updating role status:', { roleId, newStatus, transactionHash });
      const roleRef = doc(db, 'web3Roles', roleId);

      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (transactionHash) {
        updateData.transactionHash = transactionHash;
      }

      await updateDoc(roleRef, updateData);
      console.log('Role status updated successfully');
    } catch (error) {
      console.error('Error updating role status:', error);
      throw new Error(`Failed to update role status: ${error.message}`);
    }
  },

  async getRolesByAddress(address) {
    if (!address) {
      throw new Error('Address is required');
    }

    try {
      console.log('Fetching roles for address:', address);
      const rolesRef = collection(db, 'web3Roles');
      const q = query(
        rolesRef, 
        where('address', '==', address.toLowerCase())
      );

      const snapshot = await getDocs(q);
      const roles = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        roles.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt : null,
          updatedAt: data.updatedAt ? data.updatedAt : null
        });
      });

      console.log('Found roles:', roles);
      return roles;
    } catch (error) {
      console.error('Error getting roles by address:', error);
      throw new Error(`Failed to get roles by address: ${error.message}`);
    }
  },

  async getAllRoles() {
    try {
      console.log('Fetching all roles');
      const rolesRef = collection(db, 'web3Roles');
      const snapshot = await getDocs(rolesRef);
      const roles = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        roles.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt : null,
          updatedAt: data.updatedAt ? data.updatedAt : null
        });
      });

      console.log(`Found ${roles.length} roles`);
      return roles;
    } catch (error) {
      console.error('Error getting all roles:', error);
      throw new Error(`Failed to get all roles: ${error.message}`);
    }
  },

  async removeRole(roleId) {
    if (!roleId) {
      throw new Error('Role ID is required');
    }

    try {
      console.log('Removing role:', roleId);
      await deleteDoc(doc(db, 'web3Roles', roleId));
      console.log('Role removed successfully');
    } catch (error) {
      console.error('Error removing role:', error);
      throw new Error(`Failed to remove role: ${error.message}`);
    }
  },

  async getPendingRolesByTransaction(transactionHash) {
    if (!transactionHash) {
      throw new Error('Transaction hash is required');
    }

    try {
      console.log('Fetching pending roles for transaction:', transactionHash);
      const rolesRef = collection(db, 'web3Roles');
      const q = query(
        rolesRef,
        where('transactionHash', '==', transactionHash),
        where('status', '==', 'PENDING')
      );

      const snapshot = await getDocs(q);
      const roles = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        roles.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt : null,
          updatedAt: data.updatedAt ? data.updatedAt : null
        });
      });

      console.log('Found pending roles:', roles);
      return roles;
    } catch (error) {
      console.error('Error getting pending roles by transaction:', error);
      throw new Error(`Failed to get pending roles: ${error.message}`);
    }
  }
};

// =============== UTILITY FUNCTIONS ===============
export const firebaseUtils = {
  async checkConnection() {
    try {
      const testRef = collection(db, 'web3Roles');
      await getDocs(query(testRef, limit(1)));
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  },

  getServerTimestamp() {
    return serverTimestamp();
  }
};

// =============== TEST CONNECTION FUNCTION ===============
export const testFirebaseConnection = async () => {
  return await firebaseUtils.checkConnection();
};

// =============== EXPORTS ===============
export { db, auth, functions };