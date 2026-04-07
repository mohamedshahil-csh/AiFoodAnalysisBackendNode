const express = require('express');
const router = express.Router();
const {
    saveProfile,
    getProfile,
    deleteProfile,
    getProfileById,
    getAllProfiles,
    getLatestByUserId,
    getAllByUserId,
    getByDate,
    getByRange,
    getLatestLimit
} = require('../controllers/profileController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/profile', authMiddleware, saveProfile);
router.get('/profile', authMiddleware, getProfile);
router.delete('/profile', authMiddleware, deleteProfile);
router.get('/profile/all', authMiddleware, getAllProfiles); // 👈 FIRST
router.get('/profile/:id', authMiddleware, getProfileById); // 👈 AFTER
router.get('/profile/latest/:user_id', getLatestByUserId);
router.get('/profile/all/:user_id', getAllByUserId);
router.get('/profile/date/:user_id', getByDate);
router.get('/profile/range/:user_id', getByRange);
router.get('/profile/latest-limit/:user_id', getLatestLimit);
module.exports = router;