import prisma from '../utils/prisma.js';
import { encrypt, decrypt } from '../utils/cryptoUtils.js';

// Get current user profile with decrypted data
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Decrypt sensitive fields for the user
    const profile = {
      ...user,
      phone: decrypt(user.phone),
      address: decrypt(user.address),
      city: decrypt(user.city),
      guardianName: decrypt(user.guardianName),
      allergies: decrypt(user.allergies),
      medicalNotes: decrypt(user.medicalNotes),
      password: null // Never send password back
    };

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update profile with encryption
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, city, guardianName, allergies, medicalNotes, bikeModel, bikeRegNo } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone: encrypt(phone),
        address: encrypt(address),
        city: encrypt(city),
        guardianName: encrypt(guardianName),
        allergies: encrypt(allergies),
        medicalNotes: encrypt(medicalNotes),
        bikeModel,
        bikeRegNo
      }
    });

    res.json({ success: true, message: "Encrypted profile updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
