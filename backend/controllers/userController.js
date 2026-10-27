// GET /api/user/
export const getUserData = async (req, res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities || [];
        const isBlocked = req.user.isBlocked;
        res.json({ success: true, role, recentSearchedCities, isBlocked, user: req.user.toJSON() });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// POST /api/user/sync
// Direct user registration / login synchronization into MySQL table (replaces Webhooks)
export const syncUserData = async (req, res) => {
    try {
        const { email, username, image } = req.body;
        let updated = false;

        if (email && req.user.email !== email) {
            req.user.email = email;
            updated = true;
        }
        if (username && req.user.username !== username) {
            req.user.username = username;
            updated = true;
        }
        if (image && req.user.image !== image) {
            req.user.image = image;
            updated = true;
        }

        if (updated) {
            await req.user.save();
        }

        res.json({
            success: true,
            role: req.user.role,
            recentSearchedCities: req.user.recentSearchedCities || [],
            isBlocked: req.user.isBlocked,
            user: req.user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Store User Recent Searched Cities
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user;
        let cities = Array.isArray(user.recentSearchedCities) ? [...user.recentSearchedCities] : [];

        if (cities.length < 3) {
            cities.push(recentSearchedCity);
        } else {
            cities.shift();
            cities.push(recentSearchedCity);
        }
        user.recentSearchedCities = cities;
        await user.save();
        res.json({ success: true, message: "City added" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Convenient endpoint for testing/demo graduation project: become admin
// POST /api/user/make-me-admin
export const makeMeAdmin = async (req, res) => {
    try {
        req.user.role = "admin";
        await req.user.save();
        res.json({ success: true, message: "Chúc mừng! Bạn hiện đã có quyền Quản trị viên (Admin).", role: "admin" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
