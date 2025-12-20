import { Router } from 'express';
const router = Router();
import User from '../models/user.model.js';
import Friendship from '../models/friendship.model.js';
import verifyToken from '../middlewares/auth.middleware.js';

router.post('/', verifyToken, async (req, res) => {
    try {
        const { friend_user_id } = req.body;
        const userId = req.userId;
        const friend = await User.findById(friend_user_id);
        const user = await User.findById(userId);
        const friendship = new Friendship({ from: user, to: friend });
        await friendship.save();
        res.redirect('/pages/profile/'+friend_user_id);
        // res.status(201).json({ message: 'Friendship added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Friendship addition failed, ' + error.message });
    }
});

router.post('/unfollow', verifyToken, async (req, res) => {
    try {
        const { friend_user_id } = req.body;
        const userId = req.userId;
        const friend = await User.findById(friend_user_id);
        const user = await User.findById(userId);
        const friendship = await Friendship.findOneAndDelete({ from: user, to: friend });
        if (!friendship) {
            throw { message: "Friendship not found!" };
        }
        res.redirect('/pages/profile/'+friend_user_id);
        // res.status(201).json({ message: 'Friendship deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Friendship deletation failed, ' + error.message });
    }
});

router.get('/my', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        const friendship = await Friendship.find({ from: userId });
        res.status(200).json({ message: reviews });
    } catch (error) {
        res.status(500).json({ error: 'Friendships retriving failed, ' + error.message });
    }
});

export default router;