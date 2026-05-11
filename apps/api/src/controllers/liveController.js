import prisma from '../utils/prisma.js';

export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Lat and lng required' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isLive: true,
        liveLat: parseFloat(lat),
        liveLng: parseFloat(lng),
        liveUpdatedAt: new Date()
      }
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const stopLive = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    await prisma.user.update({
      where: { id: userId },
      data: { isLive: false }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { name: true, isLive: true, liveLat: true, liveLng: true, liveUpdatedAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    if (!user.isLive) {
      return res.status(403).json({ error: 'Rider is currently offline or not sharing location.', name: user.name, isLive: false });
    }

    res.json({ success: true, ...user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
