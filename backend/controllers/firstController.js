const welcomeMessage = (req, res) => {
    try {
        const { name } = req.body;

        // Input validation
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid name"
            });
        }

        const trimmedName = name.trim();
        
        if (trimmedName.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty"
            });
        }

        if (trimmedName.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Name is too long (max 50 characters)"
            });
        }

        // Generate message
        const welcomeMsg = `Nice to have you, ${trimmedName}! Welcome to promodoro`;
        
        res.status(200).json({
            success: true,
            message: welcomeMsg,
            cached: false
        });

    } catch (error) {
        console.error('Error in welcomeMessage controller:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export { welcomeMessage };