import prisma from '../utils/prisma.js';

export const triggerSOS = async (req, res) => {
  try {
    const { location, message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User must be authenticated to trigger SOS.' });
    }

    if (!location || location.lat === undefined || location.lng === undefined) {
      return res.status(400).json({ error: 'Invalid location data.' });
    }

    const sosEvent = await prisma.sOS.create({
      data: {
        userId: userId,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
        message: message || "Emergency SOS Triggered",
        resolved: false
      }
    });

    res.status(201).json({ success: true, event: sosEvent });
  } catch (error) {
    console.error("SOS Trigger Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getSOSHistory = async (req, res) => {
    try {
        const events = await prisma.sOS.findMany({
            where: { userId: req.user?.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
