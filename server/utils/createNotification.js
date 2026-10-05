const createNotification = async (userId, title, message, type = "general") => {
  return {
    user: userId,
    title,
    message,
    type,
  };
};

module.exports = createNotification;